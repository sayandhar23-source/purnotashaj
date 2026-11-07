import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../common/schemas/category.schema';
import { Product, ProductDocument } from '../common/schemas/product.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { appCache, CACHE_KEYS } from '../common/utils/ttl-cache';
import { Types } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private buildTree(all: CategoryDocument[]) {
    const byId: Record<string, any> = {};
    all.forEach((c) => {
      byId[c._id.toString()] = { ...c.toObject(), children: [] as any[] };
    });

    const roots: any[] = [];
    all.forEach((c) => {
      const node = byId[c._id.toString()];
      const parentId = c.parent?.toString();
      if (parentId && byId[parentId]) {
        byId[parentId].children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // Public: full category tree, arbitrary depth (e.g. Jewellery > Chains > Long Chain).
  // Each node gets a `children` array; leaf categories just have an empty array.
  async findAll() {
    return appCache.wrap(CACHE_KEYS.categoriesAll, 30_000, async () => {
      const all = await this.categoryModel.find({ isActive: true }).sort({ name: 1 });
      return this.buildTree(all);
    });
  }

  // Public, for nav/homepage use: same tree, but with any TOP-LEVEL category
  // removed if it (and everything under it) has zero active products. Once a
  // product is added anywhere in that branch, it reappears automatically.
  async findAllWithProducts() {
    return appCache.wrap(CACHE_KEYS.categoriesWithProducts, 30_000, async () => {
      const roots = await this.findAll();

      // ONE grouped query for every category's product count — this used to run a
      // separate count query per top-level category on every single page view.
      const counts = await this.productModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', n: { $sum: 1 } } },
      ]);
      const countById = new Map<string, number>(counts.map((c: any) => [String(c._id), c.n]));

      const branchHasProducts = (node: any): boolean =>
        (countById.get(String(node._id)) || 0) > 0 || (node.children || []).some(branchHasProducts);

      return roots.filter(branchHasProducts);
    });
  }

  // Public: immediate children of a specific category (by parent id) — used sparingly,
  // most of the frontend now just walks the full tree from findAll() instead.
  findChildren(parentId: string) {
    return this.categoryModel.find({ parent: parentId, isActive: true }).sort({ name: 1 });
  }

  // Admin: flat list of every category (active or not), with immediate parent populated,
  // for the admin category management screen.
  findAllAdmin() {
    return this.categoryModel.find().populate('parent', 'name').sort({ name: 1 });
  }

  private clearCache() {
    appCache.del(CACHE_KEYS.categoriesAll, CACHE_KEYS.categoriesWithProducts);
  }

  async create(dto: CreateCategoryDto) {
    const created = await this.categoryModel.create({ ...dto, parent: dto.parent || null });
    this.clearCache();
    return created;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Category not found');
    if (dto.parent && String(dto.parent) === String(id)) {
      throw new BadRequestException('A category cannot be its own parent.');
    }
    const update: any = { ...dto };
    if ('parent' in dto) update.parent = dto.parent || null;
    const cat = await this.categoryModel.findByIdAndUpdate(id, update, { new: true });
    if (!cat) throw new NotFoundException('Category not found');
    this.clearCache();
    return cat;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Category not found');
    const cat = await this.categoryModel.findByIdAndDelete(id);
    if (!cat) throw new NotFoundException('Category not found');
    this.clearCache();
    return { message: 'Category deleted' };
  }
}
