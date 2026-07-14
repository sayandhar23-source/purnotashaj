/**
 * Run with: npm run seed
 * Creates an admin user, a full category tree (top-level categories with subcategories,
 * including a 3-level branch for Jewellery > Chains > Long Chain / Small Chain), and ~37
 * demo products spread across every category — each with 2-3 images (for the hover-cycle
 * and swipe gallery) and a mix of isFeatured / isNewArrival / isBestSeller / isHotDeal flags
 * so every homepage section has something to show. Safe to re-run — skips anything that
 * already exists by matching on email/slug/title.
 */
import * as dns from "node:dns";
import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserSchema } from './common/schemas/user.schema';
import { CategorySchema } from './common/schemas/category.schema';
import { ProductSchema } from './common/schemas/product.schema';
import { generateSku } from './common/utils/sku.util';

function placeholderImage(label: string, bg = 'eee0d8', fg = '5f2814') {
  return `https://placehold.co/600x800/${bg}/${fg}?text=${encodeURIComponent(label)}`;
}

type CategoryNode = {
  name: string;
  slug: string;
  description?: string;
  children?: CategoryNode[];
};

const categoryTree: CategoryNode[] = [
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Apparel for every occasion',
    children: [
      { name: 'T-Shirts', slug: 'clothing-tshirts' },
      { name: 'Dresses', slug: 'clothing-dresses' },
    ],
  },
  {
    name: 'Saree',
    slug: 'saree',
    description: 'Silk and cotton sarees for every occasion',
    children: [
      { name: 'Silk Saree', slug: 'saree-silk' },
      { name: 'Cotton Saree', slug: 'saree-cotton' },
    ],
  },
  {
    name: 'Jewellery',
    slug: 'jewellery',
    description: 'Necklaces, rings, earrings and more',
    children: [
      { name: 'Nose Ring', slug: 'jewellery-nose-ring' },
      { name: 'Nose Pin', slug: 'jewellery-nose-pin' },
      { name: 'Earrings', slug: 'jewellery-earrings' },
      { name: 'Bracelets', slug: 'jewellery-bracelets' },
      { name: 'Bangles', slug: 'jewellery-bangles' },
      {
        name: 'Chains',
        slug: 'jewellery-chains',
        children: [
          { name: 'Long Chain', slug: 'jewellery-chains-long' },
          { name: 'Small Chain', slug: 'jewellery-chains-small' },
        ],
      },
      { name: 'Choker', slug: 'jewellery-choker' },
      { name: 'Hairband', slug: 'jewellery-hairband' },
      { name: 'Rings', slug: 'jewellery-rings' },
    ],
  },
  {
    name: 'Ornaments',
    slug: 'ornaments',
    description: 'Decorative ornaments for the home',
    children: [
      { name: 'Wall Decor', slug: 'ornaments-wall-decor' },
      { name: 'Showpieces', slug: 'ornaments-showpieces' },
    ],
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Cosmetics and beauty essentials',
    children: [
      { name: 'Lipstick', slug: 'makeup-lipstick' },
      { name: 'Skincare', slug: 'makeup-skincare' },
    ],
  },
  {
    name: 'Perfumes',
    slug: 'perfumes',
    description: 'Fragrances for men and women',
    children: [
      { name: "Men's Perfume", slug: 'perfumes-men' },
      { name: "Women's Perfume", slug: 'perfumes-women' },
    ],
  },
];

type DemoProduct = {
  title: string;
  categorySlug: string; // exact category/subcategory this product belongs to
  topTag: string; // top-level slug, stored in tags[] for convenience
  price: number;
  compareAtPrice?: number;
  variantAttr?: { label: string; options: string[] };
  flags?: Array<'featured' | 'newArrival' | 'bestSeller' | 'hotDeal'>;
  description: string;
};

const demoProducts: DemoProduct[] = [
  // Clothing
  { title: 'Classic Cotton T-Shirt', categorySlug: 'clothing-tshirts', topTag: 'clothing', price: 599, compareAtPrice: 799, variantAttr: { label: 'Size', options: ['S', 'M', 'L', 'XL'] }, flags: ['featured'], description: 'A soft, breathable everyday cotton tee.' },
  { title: 'Graphic Print T-Shirt', categorySlug: 'clothing-tshirts', topTag: 'clothing', price: 699, variantAttr: { label: 'Size', options: ['S', 'M', 'L'] }, flags: ['newArrival'], description: 'Bold graphic print on premium cotton.' },
  { title: 'Striped Polo Tee', categorySlug: 'clothing-tshirts', topTag: 'clothing', price: 749, variantAttr: { label: 'Size', options: ['M', 'L', 'XL'] }, description: 'Smart-casual striped polo, great for layering.' },
  { title: 'Floral Summer Dress', categorySlug: 'clothing-dresses', topTag: 'clothing', price: 1499, compareAtPrice: 1899, variantAttr: { label: 'Size', options: ['S', 'M', 'L'] }, flags: ['bestSeller'], description: 'Light, flowy floral dress perfect for summer days.' },
  { title: 'Evening Wrap Dress', categorySlug: 'clothing-dresses', topTag: 'clothing', price: 2199, compareAtPrice: 2699, variantAttr: { label: 'Size', options: ['S', 'M', 'L', 'XL'] }, flags: ['hotDeal'], description: 'Elegant wrap dress for evening occasions.' },

  // Saree
  { title: 'Banarasi Silk Saree', categorySlug: 'saree-silk', topTag: 'saree', price: 3499, compareAtPrice: 4299, flags: ['featured', 'hotDeal'], description: 'Rich Banarasi weave with intricate zari border.' },
  { title: 'Kanjivaram Silk Saree', categorySlug: 'saree-silk', topTag: 'saree', price: 4999, flags: ['bestSeller'], description: 'Traditional Kanjivaram silk with temple border.' },
  { title: 'Designer Silk Saree', categorySlug: 'saree-silk', topTag: 'saree', price: 3999, compareAtPrice: 4599, description: 'Contemporary print on pure silk base.' },
  { title: 'Printed Cotton Saree', categorySlug: 'saree-cotton', topTag: 'saree', price: 1299, flags: ['newArrival'], description: 'Everyday cotton saree with block print detailing.' },
  { title: 'Handloom Cotton Saree', categorySlug: 'saree-cotton', topTag: 'saree', price: 1599, description: 'Handwoven cotton, breathable and lightweight.' },

  // Jewellery
  { title: 'Diamond-Cut Nose Ring', categorySlug: 'jewellery-nose-ring', topTag: 'jewellery', price: 399, flags: ['newArrival'], description: 'Delicate diamond-cut nose ring, everyday wear.' },
  { title: 'Gold Polish Nose Pin', categorySlug: 'jewellery-nose-pin', topTag: 'jewellery', price: 249, description: 'Classic gold-polish nose pin with subtle shine.' },
  { title: 'Traditional Jhumka Earrings', categorySlug: 'jewellery-earrings', topTag: 'jewellery', price: 899, compareAtPrice: 1099, flags: ['featured', 'hotDeal'], description: 'Statement jhumkas with intricate detailing.' },
  { title: 'Stud Earrings Set', categorySlug: 'jewellery-earrings', topTag: 'jewellery', price: 499, flags: ['bestSeller'], description: 'Set of 3 everyday stud earrings.' },
  { title: 'Beaded Charm Bracelet', categorySlug: 'jewellery-bracelets', topTag: 'jewellery', price: 599, description: 'Layered beaded bracelet with charm accents.' },
  { title: 'Kada Bangle Set', categorySlug: 'jewellery-bangles', topTag: 'jewellery', price: 1299, flags: ['bestSeller'], description: 'Set of traditional kada bangles.' },
  { title: 'Long Rope Chain', categorySlug: 'jewellery-chains-long', topTag: 'jewellery', price: 1899, flags: ['featured'], description: 'Long layering rope chain, gold-plated.' },
  { title: 'Delicate Small Chain', categorySlug: 'jewellery-chains-small', topTag: 'jewellery', price: 999, description: 'Fine everyday chain, subtle and elegant.' },
  { title: 'Antique Choker Necklace', categorySlug: 'jewellery-choker', topTag: 'jewellery', price: 2199, compareAtPrice: 2599, flags: ['hotDeal'], description: 'Antique-finish choker with statement detailing.' },
  { title: 'Pearl Hairband', categorySlug: 'jewellery-hairband', topTag: 'jewellery', price: 799, flags: ['newArrival'], description: 'Pearl-embellished hairband for special occasions.' },
  { title: 'Stackable Band Ring Set', categorySlug: 'jewellery-rings', topTag: 'jewellery', price: 899, description: 'Set of 3 stackable bands for mixing and matching.' },
  { title: 'Solitaire Ring', categorySlug: 'jewellery-rings', topTag: 'jewellery', price: 1999, flags: ['featured'], description: 'Timeless solitaire-style statement ring.' },

  // Ornaments
  { title: 'Wooden Mandala Wall Art', categorySlug: 'ornaments-wall-decor', topTag: 'ornaments', price: 1899, compareAtPrice: 2299, flags: ['featured'], description: 'Hand-carved wooden mandala for statement wall decor.' },
  { title: 'Macrame Wall Hanging', categorySlug: 'ornaments-wall-decor', topTag: 'ornaments', price: 1099, description: 'Boho macrame hanging, handwoven cotton cord.' },
  { title: 'Metallic Sun Wall Decor', categorySlug: 'ornaments-wall-decor', topTag: 'ornaments', price: 1599, flags: ['newArrival'], description: 'Statement metallic sun piece for any room.' },
  { title: 'Brass Elephant Showpiece', categorySlug: 'ornaments-showpieces', topTag: 'ornaments', price: 1299, flags: ['bestSeller'], description: 'Detailed brass elephant figurine, a symbol of good luck.' },
  { title: 'Crystal Decorative Vase', categorySlug: 'ornaments-showpieces', topTag: 'ornaments', price: 1799, description: 'Faceted crystal-effect vase for flowers or standalone display.' },

  // Makeup
  { title: 'Matte Liquid Lipstick', categorySlug: 'makeup-lipstick', topTag: 'makeup', price: 449, compareAtPrice: 549, flags: ['featured', 'hotDeal'], description: 'Long-wear matte liquid lipstick, transfer-proof formula.' },
  { title: 'Glossy Tinted Lip Balm', categorySlug: 'makeup-lipstick', topTag: 'makeup', price: 299, description: 'Hydrating tinted balm with a natural glossy finish.' },
  { title: 'Velvet Matte Lipstick Duo', categorySlug: 'makeup-lipstick', topTag: 'makeup', price: 699, flags: ['newArrival'], description: 'Two-in-one velvet matte lipstick set.' },
  { title: 'Vitamin C Face Serum', categorySlug: 'makeup-skincare', topTag: 'makeup', price: 899, compareAtPrice: 1099, flags: ['bestSeller'], description: 'Brightening vitamin C serum for daily glow.' },
  { title: 'Hydrating Gel Moisturizer', categorySlug: 'makeup-skincare', topTag: 'makeup', price: 649, description: 'Lightweight gel moisturizer for all skin types.' },

  // Perfumes
  { title: 'Oud Intense EDP', categorySlug: 'perfumes-men', topTag: 'perfumes', price: 1999, compareAtPrice: 2499, flags: ['featured', 'hotDeal'], description: 'Rich oud-based eau de parfum for men.' },
  { title: 'Woody Musk Cologne', categorySlug: 'perfumes-men', topTag: 'perfumes', price: 1499, flags: ['newArrival'], description: 'Fresh woody musk cologne, everyday wear.' },
  { title: 'Floral Bloom EDP', categorySlug: 'perfumes-women', topTag: 'perfumes', price: 1799, flags: ['bestSeller'], description: 'Delicate floral eau de parfum for women.' },
  { title: 'Rose Attar Perfume', categorySlug: 'perfumes-women', topTag: 'perfumes', price: 1299, description: 'Traditional rose attar, alcohol-free.' },
  { title: 'Citrus Fresh Eau de Toilette', categorySlug: 'perfumes-women', topTag: 'perfumes', price: 999, description: 'Bright citrus eau de toilette for daytime wear.' },
];

async function seed() {
  dns.setServers(["8.8.8.8"]);

  console.log("DNS Servers:", dns.getServers());

  await mongoose.connect(process.env.MONGODB_URI as string);

  const UserModel = mongoose.model('User', UserSchema);
  const CategoryModel = mongoose.model('Category', CategorySchema);
  const ProductModel = mongoose.model('Product', ProductSchema);

  // --- Admin user ---
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@yourstore.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await UserModel.create({
      name: 'Store Admin',
      email: adminEmail,
      passwordHash,
      isVerified: true,
      role: 'admin',
    });
    console.log(`✔ Admin user created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  // --- Category tree (arbitrary depth) ---
  const categoryBySlug: Record<string, any> = {};

  async function createCategoryTree(nodes: CategoryNode[], parentId: any, depth: number) {
    for (const node of nodes) {
      let doc = await CategoryModel.findOne({ slug: node.slug });
      if (!doc) {
        doc = await CategoryModel.create({
          name: node.name,
          slug: node.slug,
          description: node.description,
          parent: parentId,
        });
        console.log(`${'  '.repeat(depth)}${depth ? '↳ ' : '✔ '}Category created: ${node.name}`);
      }
      categoryBySlug[node.slug] = doc;
      if (node.children?.length) {
        await createCategoryTree(node.children, doc._id, depth + 1);
      }
    }
  }
  await createCategoryTree(categoryTree, null, 0);

  // --- Demo products ---
  let created = 0;
  for (const p of demoProducts) {
    const exists = await ProductModel.findOne({ title: p.title });
    if (exists) continue;

    const categoryDoc = categoryBySlug[p.categorySlug];
    if (!categoryDoc) {
      console.warn(`  ! Skipping "${p.title}" — category "${p.categorySlug}" not found.`);
      continue;
    }
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let variants: any[] = [];
    if (p.variantAttr) {
      variants = p.variantAttr.options.map((opt, i) => ({
        name: opt,
        attributes: { [p.variantAttr!.label.toLowerCase()]: opt },
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: 20 + i * 5,
        sku: generateSku(categoryDoc.name, p.title, opt, i),
      }));
    }

    const totalStock = variants.length > 0 ? variants.reduce((s, v) => s + v.stock, 0) : 50;
    const images = [
      placeholderImage(`${p.title} 1`),
      placeholderImage(`${p.title} 2`, 'f5e6d3', '82361a'),
      placeholderImage(`${p.title} 3`, 'ead9c9', '3d1a0d'),
    ];

    const flags = p.flags || [];
    await ProductModel.create({
      title: p.title,
      slug,
      description: p.description,
      category: categoryDoc._id,
      images,
      basePrice: p.price,
      compareAtPrice: p.compareAtPrice,
      sku: variants.length === 0 ? generateSku(categoryDoc.name, p.title, undefined, 0) : undefined,
      variants,
      totalStock,
      isActive: true,
      isFeatured: flags.includes('featured'),
      isNewArrival: flags.includes('newArrival'),
      isBestSeller: flags.includes('bestSeller'),
      isHotDeal: flags.includes('hotDeal'),
      tags: [p.topTag],
    });
    created++;
  }
  console.log(`✔ ${created} demo product(s) created.`);

  console.log('\nSeed complete.');
  console.log(`\nAdmin login → URL: /account/login   Email: ${adminEmail}   Password: ${adminPassword}`);
  console.log('After logging in, the admin dashboard is at /admin/dashboard.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
