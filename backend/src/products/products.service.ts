import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product, ProductDocument } from '../common/schemas/product.schema';
import { Category, CategoryDocument } from '../common/schemas/category.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateSku } from '../common/utils/sku.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private computeTotalStock(dto: Partial<CreateProductDto>): number {
    if (!dto.variants || dto.variants.length === 0) return 0;
    return dto.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }

  private async withGeneratedSkus(dto: Partial<CreateProductDto>) {
    let categoryName: string | undefined;
    if (dto.category) {
      const cat = await this.categoryModel.findById(dto.category);
      categoryName = cat?.name;
    }

    const result: any = { ...dto };

    if (dto.variants && dto.variants.length > 0) {
      result.variants = dto.variants.map((v, i) => ({
        ...v,
        sku: v.sku && v.sku.trim() ? v.sku.trim() : generateSku(categoryName, dto.title || 'ITEM', v.name, i),
      }));
    } else if (dto.title) {
      // Simple product with no variants — give it a base SKU if it doesn't have one
      result.sku = generateSku(categoryName, dto.title, undefined, 0);
    }

    return result;
  }

  async create(dto: CreateProductDto) {
    const withSkus = await this.withGeneratedSkus(dto);
    const totalStock = this.computeTotalStock(dto);
    return this.productModel.create({ ...withSkus, totalStock });
  }

  async findAll(query: {
    category?: string;
    categories?: string[]; // used for "this category + its subcategories"
    search?: string;
    featured?: string;
    newArrival?: string;
    bestSeller?: string;
    hotDeal?: string;
    excludeId?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = { isActive: true };
    if (query.categories && query.categories.length > 0) {
      filter.category = { $in: query.categories };
    } else if (query.category) {
      filter.category = query.category;
    }
    if (query.featured === 'true') filter.isFeatured = true;
    if (query.newArrival === 'true') filter.isNewArrival = true;
    if (query.bestSeller === 'true') filter.isBestSeller = true;
    if (query.hotDeal === 'true') filter.isHotDeal = true;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    if (query.excludeId) filter._id = { $ne: query.excludeId };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total, page, pages: Math.ceil(total / limit) };
  }

  // Admin: list everything including inactive
  async findAllAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel.find().populate('category').sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.productModel.countDocuments(),
    ]);
    return { products, total, page, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel.findOne({ slug, isActive: true }).populate('category');
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).populate('category');
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const withSkus = await this.withGeneratedSkus(dto);
    const update: any = { ...withSkus };
    if (dto.variants) update.totalStock = this.computeTotalStock(dto);
    const product = await this.productModel.findByIdAndUpdate(id, update, { new: true });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product deleted' };
  }
}
