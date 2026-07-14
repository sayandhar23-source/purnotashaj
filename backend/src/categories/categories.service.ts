import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../common/schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  // Public: full category tree, arbitrary depth (e.g. Jewellery > Chains > Long Chain).
  // Each node gets a `children` array; leaf categories just have an empty array.
  async findAll() {
    const all = await this.categoryModel.find({ isActive: true }).sort({ name: 1 });

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
