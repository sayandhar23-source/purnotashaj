import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Product, ProductDocument } from '../common/schemas/product.schema';
import { Category, CategoryDocument } from '../common/schemas/category.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateSku } from '../common/utils/sku.util';
import { computeSaleInfo } from '../common/utils/sale.util';
import { appCache, CACHE_KEYS } from '../common/utils/ttl-cache';
import { escapeRegex } from '../common/utils/regex.util';
import { clampLimit, clampPage } from '../common/utils/pagination';
import { buildPriceConditions } from './price-filter';

// Occasions shoppers can browse by. A product belongs to one by carrying its key in `tags`
// (set from Admin → Products → Occasions).
export const OCCASION_TAGS = ['pujo', 'wedding', 'haldi', 'office', 'gifting'];

const round2 = (n: number) => Math.round(n * 100) / 100;

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

  // Attaches a computed `saleInfo` object to a product (or list of products) —
  // never stored, always derived fresh from saleEnabled/salePrice/saleStartsAt/saleEndsAt.
  private withSaleInfo(product: any) {
    const obj = typeof product.toObject === 'function' ? product.toObject() : product;
    const isSoldOut =
      obj.variants?.length > 0
        ? (obj.totalStock ?? 0) <= 0
        : obj.trackStock
          ? (obj.stock ?? 0) <= 0
          : false;
    return { ...obj, saleInfo: computeSaleInfo(obj), isSoldOut };
  }

  private withSaleInfoList(products: any[]) {
    return products.map((p) => this.withSaleInfo(p));
  }

  async create(dto: CreateProductDto) {
    const withSkus = await this.withGeneratedSkus(dto);
    const totalStock = this.computeTotalStock(dto);
    appCache.del(CACHE_KEYS.categoriesWithProducts);
    appCache.delPrefix('occasions:');
    appCache.delPrefix('looks:');
    return this.productModel.create({ ...withSkus, totalStock });
  }

  async findAll(query: {
    category?: string;
    categories?: string[]; // used for "this category + its subcategories"
    search?: string;
    tag?: string;
    featured?: string;
    newArrival?: string;
    bestSeller?: string;
    hotDeal?: string;
    excludeId?: string;
    sort?: string; // 'newest' | 'price-asc' | 'price-desc'
    priceMin?: number;
    priceMax?: number;
    page?: number;
    limit?: number;
  }) {
    const filter: any = { isActive: true };
    // Malformed ids used to throw a database cast error (HTTP 500); now they're just ignored
    const validIds = (ids: string[] = []) => ids.filter((id) => Types.ObjectId.isValid(id));
    if (query.categories && query.categories.length > 0) {
      filter.category = { $in: validIds(query.categories) };
    } else if (query.category && Types.ObjectId.isValid(query.category)) {
      filter.category = query.category;
    }
    if (query.featured === 'true') filter.isFeatured = true;
    if (query.newArrival === 'true') filter.isNewArrival = true;
    if (query.bestSeller === 'true') filter.isBestSeller = true;
    if (query.hotDeal === 'true') filter.isHotDeal = true;
    if (typeof query.search === 'string' && query.search.trim()) {
      filter.title = { $regex: escapeRegex(query.search.trim().slice(0, 100)), $options: 'i' };
    }
    if (query.excludeId && Types.ObjectId.isValid(query.excludeId)) filter._id = { $ne: query.excludeId };
    if (typeof query.tag === 'string' && /^[a-z0-9-]{1,30}$/.test(query.tag)) filter.tags = query.tag;
    const priceConds = buildPriceConditions(
      Number.isFinite(query.priceMin) ? query.priceMin : undefined,
      Number.isFinite(query.priceMax) ? query.priceMax : undefined,
    );
    if (priceConds.length) filter.$and = priceConds;

    const sortMap: Record<string, any> = {
      newest: { createdAt: -1 },
      'price-asc': { basePrice: 1 },
      'price-desc': { basePrice: -1 },
    };
    const sortBy = sortMap[query.sort || 'newest'] || sortMap.newest;

    const page = clampPage(query.page);
    const limit = clampLimit(query.limit, 20, 60);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        // Long descriptions/videos are only needed on the product page itself —
        // leaving them out makes every listing (homepage rows, categories, search) much lighter.
        .select('-description -videoUrl')
        .populate('category')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return { products: this.withSaleInfoList(products), total, page, pages: Math.ceil(total / limit) };
  }

  // Products for the dedicated /sale page: anything individually flagged
  // showOnSalePage=true, plus everything in a category (or its subcategories)
  // that has showOnSalePage=true.
  async findSalePageProducts() {
    const allCategories = await this.categoryModel.find({ isActive: true });

    const childrenByParent: Record<string, any[]> = {};
    allCategories.forEach((c) => {
      const key = c.parent ? c.parent.toString() : 'root';
      childrenByParent[key] = childrenByParent[key] || [];
      childrenByParent[key].push(c);
    });

    function collectDescendantIds(id: string): string[] {
      const children = childrenByParent[id] || [];
      let ids: string[] = [];
      for (const child of children) {
        ids.push(child._id.toString());
        ids.push(...collectDescendantIds(child._id.toString()));
      }
      return ids;
    }

    const flaggedCategories = allCategories.filter((c) => c.showOnSalePage);
    let categoryIds: string[] = [];
    flaggedCategories.forEach((c) => {
      categoryIds.push(c._id.toString());
      categoryIds.push(...collectDescendantIds(c._id.toString()));
    });

    const filter: any = {
      isActive: true,
      $or: [{ showOnSalePage: true }, ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : [])],
    };

    const products = await this.productModel.find(filter).populate('category').sort({ createdAt: -1 });
    return this.withSaleInfoList(products);
  }

  // Admin: list everything including inactive
  async findAllAdmin(rawPage: unknown = 1, rawLimit: unknown = 20) {
    const page = clampPage(rawPage);
    const limit = clampLimit(rawLimit, 20, 500);
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel.find().populate('category').sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.productModel.countDocuments(),
    ]);
    return { products: this.withSaleInfoList(products), total, page, pages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel.findOne({ slug, isActive: true }).populate('category');
    if (!product) throw new NotFoundException('Product not found');
    return this.withSaleInfo(product);
  }




  // ---- Homepage: "Occasion Edit" and "For You" -------------------------------
  // One call returns every occasion's products + count, so the homepage needs a single
  // request, and occasions nobody has tagged anything for can simply be hidden.
  async findByOccasions(rawLimit: unknown) {
    const limit = clampLimit(rawLimit, 8, 12);
    return appCache.wrap(`occasions:${limit}`, 30_000, async () => {
      const entries = await Promise.all(
        OCCASION_TAGS.map(async (tag) => {
          const [products, total] = await Promise.all([
            this.productModel
              .find({ isActive: true, tags: tag })
              .select('-description -videoUrl')
              .sort({ createdAt: -1 })
              .limit(limit)
              .lean(),
            this.productModel.countDocuments({ isActive: true, tags: tag }),
          ]);
          return [tag, { total, products: this.withSaleInfoList(products) }] as const;
        }),
      );
      return Object.fromEntries(entries);
    });
  }

  // The few fields a "look" card needs — keeps the homepage payload small.
  private slimLookProduct(p: any) {
    const wrapped: any = this.withSaleInfo(p);
    const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
    const sale = wrapped.saleInfo;
    const price = hasVariants ? p.variants[0].price : sale?.isActive ? sale.effectivePrice : p.basePrice;
    const compare = hasVariants ? p.variants[0].compareAtPrice : sale?.isActive ? sale.originalPrice : p.compareAtPrice;
    return {
      _id: String(p._id),
      slug: p.slug,
      title: p.title,
      image: p.images?.[0] || null,
      price,
      comparePrice: compare && compare > price ? compare : null,
      hasVariants,
      isSoldOut: !!wrapped.isSoldOut,
    };
  }

  // "For You": looks = a hero product plus the items that go with it.
  //  1. Hand-curated — products whose "Complete the look" picks you've set in the admin.
  //  2. Otherwise filled automatically — newest sarees paired with jewellery.
  // Sold-out or photo-less products never appear.
  async getLooks(rawLimit: unknown) {
    const limit = clampLimit(rawLimit, 6, 12);
    return appCache.wrap(`looks:${limit}`, 60_000, async () => {
      const looks: any[] = [];
      const used = new Set<string>();

      const pushLook = (hero: any, items: any[]) => {
        const h = this.slimLookProduct(hero);
        if (h.isSoldOut || !h.image) return;
        const slimItems = items.map((i) => this.slimLookProduct(i)).filter((i) => !i.isSoldOut).slice(0, 3);
        if (slimItems.length === 0) return;
        used.add(h._id);
        looks.push({
          _id: h._id,
          slug: hero.slug,
          title: hero.title,
          image: h.image,
          hasVideo: !!hero.videoUrl,
          hero: h,
          items: slimItems,
          total: round2(h.price + slimItems.reduce((sum, i) => sum + i.price, 0)),
        });
      };

      const curated: any[] = await this.productModel
        .find({ isActive: true, 'recommendedProducts.0': { $exists: true } })
        .select('-description')
        .sort({ createdAt: -1 })
        .limit(limit * 2)
        .lean();
      for (const hero of curated) {
        if (looks.length >= limit) break;
        const ids = (hero.recommendedProducts || []).map((id: any) => String(id));
        const found: any[] = await this.productModel
          .find({ _id: { $in: ids }, isActive: true })
          .select('-description -videoUrl')
          .lean();
        const byId = new Map(found.map((p) => [String(p._id), p]));
        pushLook(hero, ids.map((id: string) => byId.get(id)).filter(Boolean));
      }

      if (looks.length < limit) {
        const categories: any[] = await this.categoryModel.find().select('name slug parent isActive').lean();
        const catById = new Map(categories.map((c) => [String(c._id), c]));
        const idsFor = (keyword: string) =>
          categories
            .filter((c) => c.isActive !== false && this.categoryChainMatches(String(c._id), catById, keyword))
            .map((c) => c._id);
        const sareeCats = idsFor('saree');
        const jewelCats = idsFor('jewel');
        if (sareeCats.length > 0 && jewelCats.length > 0) {
          const [sarees, jewels]: any[] = await Promise.all([
            this.productModel
              .find({ category: { $in: sareeCats }, isActive: true, _id: { $nin: [...used] } })
              .select('-description')
              .sort({ createdAt: -1 })
              .limit((limit - looks.length) * 2)
              .lean(),
            this.productModel
              .find({ category: { $in: jewelCats }, isActive: true })
              .select('-description -videoUrl')
              .limit(40)
              .lean(),
          ]);
          const pool: any[] = this.withSaleInfoList(jewels).filter((j: any) => !j.isSoldOut);
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
          let k = 0;
          for (const hero of sarees) {
            if (looks.length >= limit || pool.length === 0) break;
            const picks = [...new Set([pool[k % pool.length], pool[(k + 1) % pool.length]])];
            k += 2;
            pushLook(hero, picks);
          }
        }
      }
      return looks;
    });
  }

  // ---- Inventory --------------------------------------------------------
  // Stock used to be display-only: nothing ever reduced it, so the "only 1 left"
  // item could be sold to any number of customers. These run when payment
  // succeeds (deduct) or an order is cancelled (restock). Each is a single
  // atomic conditional update, so two buyers racing for the last unit can't both get it.

  // Returns a description of any line that couldn't be fully deducted (stock ran
  // out between checkout and payment) so the admin can sort it out — the payment
  // has already gone through, so it can't just be refused at this point.
  async deductStock(
    items: { product: any; variantId?: string; title?: string; variantName?: string; quantity: number }[],
  ): Promise<string[]> {
    const shortfalls: string[] = [];
    for (const item of items) {
      const productId = new Types.ObjectId(String(item.product));
      const label = item.title + (item.variantName ? ` (${item.variantName})` : '');

      if (item.variantId) {
        const res = await this.productModel.updateOne(
          {
            _id: productId,
            variants: { $elemMatch: { _id: new Types.ObjectId(item.variantId), stock: { $gte: item.quantity } } },
          },
          { $inc: { 'variants.$.stock': -item.quantity, totalStock: -item.quantity } },
        );
        if (res.modifiedCount === 0) shortfalls.push(label);
      } else {
        const res = await this.productModel.updateOne(
          { _id: productId, trackStock: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );
        if (res.modifiedCount === 0) {
          const p: any = await this.productModel.findById(productId).select('trackStock').lean();
          if (p?.trackStock) shortfalls.push(label); // untracked products have no stock to take from
        }
      }
    }
    return shortfalls;
  }

  async restockItems(items: { product: any; variantId?: string; quantity: number }[]) {
    for (const item of items) {
      const productId = new Types.ObjectId(String(item.product));
      if (item.variantId) {
        await this.productModel.updateOne(
          { _id: productId, 'variants._id': new Types.ObjectId(item.variantId) },
          { $inc: { 'variants.$.stock': item.quantity, totalStock: item.quantity } },
        );
      } else {
        await this.productModel.updateOne(
          { _id: productId, trackStock: true },
          { $inc: { stock: item.quantity } },
        );
      }
    }
  }

  // Walks from a category up through its parents, returning true if the
  // category (or any ancestor) has the keyword in its name/slug — so a
  // "Cotton Saree" subcategory counts as being inside "Saree".
  private categoryChainMatches(catId: string, byId: Map<string, any>, keyword: string): boolean {
    const seen = new Set<string>();
    let current = byId.get(catId);
    while (current && !seen.has(current._id.toString())) {
      seen.add(current._id.toString());
      if (`${current.name} ${current.slug}`.toLowerCase().includes(keyword)) return true;
      current = current.parent ? byId.get(current.parent.toString()) : undefined;
    }
    return false;
  }

  // "Complete the look" suggestions for a product page:
  //  1. Products the admin hand-picked for this product (in the order picked), or
  //  2. if none are set and this is a saree, a random handful of jewellery.
  // Inactive and sold-out products are never suggested.
  async getRecommendations(productId: string) {
    if (!Types.ObjectId.isValid(productId)) throw new NotFoundException('Product not found');
    const product: any = await this.productModel
      .findById(productId)
      .select('category recommendedProducts')
      .lean();
    if (!product) throw new NotFoundException('Product not found');

    const pickedIds: string[] = (product.recommendedProducts || []).map((id: any) => id.toString());
    if (pickedIds.length > 0) {
      const found = await this.productModel.find({ _id: { $in: pickedIds }, isActive: true });
      const byId = new Map(found.map((p) => [p._id.toString(), p]));
      const ordered = pickedIds.map((id) => byId.get(id)).filter(Boolean);
      const available = this.withSaleInfoList(ordered).filter((p) => !p.isSoldOut);
      if (available.length > 0) return available;
    }

    const categories: any[] = await this.categoryModel.find().select('name slug parent isActive').lean();
    const catById = new Map(categories.map((c) => [c._id.toString(), c]));

    if (!product.category || !this.categoryChainMatches(product.category.toString(), catById, 'saree')) {
      return [];
    }

    const jewelleryCategoryIds = categories
      .filter((c) => c.isActive !== false && this.categoryChainMatches(c._id.toString(), catById, 'jewel'))
      .map((c) => c._id);
    if (jewelleryCategoryIds.length === 0) return [];

    const pool = await this.productModel
      .find({ category: { $in: jewelleryCategoryIds }, isActive: true, _id: { $ne: product._id } })
      .limit(60);
    const available = this.withSaleInfoList(pool).filter((p) => !p.isSoldOut);

    // Fisher–Yates shuffle, so each visit sees a different selection
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    return available.slice(0, 4);
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).populate('category');
    if (!product) throw new NotFoundException('Product not found');
    return this.withSaleInfo(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const withSkus = await this.withGeneratedSkus(dto);
    const update: any = { ...withSkus };
    if (dto.variants) update.totalStock = this.computeTotalStock(dto);
    const product = await this.productModel.findByIdAndUpdate(id, update, { new: true });
    if (!product) throw new NotFoundException('Product not found');
    appCache.del(CACHE_KEYS.categoriesWithProducts);
    appCache.delPrefix('occasions:');
    appCache.delPrefix('looks:');
    return this.withSaleInfo(product);
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new NotFoundException('Product not found');
    appCache.del(CACHE_KEYS.categoriesWithProducts);
    appCache.delPrefix('occasions:');
    appCache.delPrefix('looks:');
    return { message: 'Product deleted' };
  }
}
