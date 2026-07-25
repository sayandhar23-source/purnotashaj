import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../common/schemas/category.schema';
import { Product, ProductDocument } from '../common/schemas/product.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

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
    const all = await this.categoryModel.find({ isActive: true }).sort({ name: 1 });
    return this.buildTree(all);
  }

  // Public, for nav/homepage use: same tree, but with any TOP-LEVEL category
  // removed if it (and everything under it) has zero active products. Once a
  // product is added anywhere in that branch, it reappears automatically.
  async findAllWithProducts() {
    const roots = await this.findAll();

    const collectIds = (node: any): string[] => {
      const ids = [node._id.toString()];
      for (const child of node.children || []) ids.push(...collectIds(child));
      return ids;
    };

    const withProducts = await Promise.all(
      roots.map(async (root) => {
        const ids = collectIds(root);
        const count = await this.productModel.countDocuments({
          category: { $in: ids },
          isActive: true,
        });
        return count > 0 ? root : null;
      }),
    );

    return withProducts.filter(Boolean);
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

  create(dto: CreateCategoryDto) {
    return this.categoryModel.create({ ...dto, parent: dto.parent || null });
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const update: any = { ...dto };
    if ('parent' in dto) update.parent = dto.parent || null;
    const cat = await this.categoryModel.findByIdAndUpdate(id, update, { new: true });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async remove(id: string) {
    const cat = await this.categoryModel.findByIdAndDelete(id);
    if (!cat) throw new NotFoundException('Category not found');
    return { message: 'Category deleted' };
  }
}
