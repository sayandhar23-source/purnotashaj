// The occasions shoppers can browse by. A product belongs to one when its `tags` contain
// the key — tick them per product in Admin → Products → Occasions.
// (The same five keys are listed in backend/src/products/products.service.ts.)
export type OccasionKey = 'pujo' | 'wedding' | 'haldi' | 'office' | 'gifting';

export type Occasion = {
  key: OccasionKey;
  label: string;
  eyebrow: string;
  title: string;
  blurb: string;
  gradient: string;
};

export const OCCASIONS: Occasion[] = [
  { key: 'pujo', label: 'Pujo', eyebrow: 'THE PUJO EDIT', title: 'Lal-paar & festive cottons',
    blurb: 'Reds, whites and golds for every day of the festival.', gradient: 'linear-gradient(145deg,#8a2236,#4a0e1e)' },
  { key: 'wedding', label: 'Wedding guest', eyebrow: 'WEDDING GUEST', title: 'Rich weaves that photograph beautifully',
    blurb: 'Elegant sarees you can wear from sangeet to reception.', gradient: 'linear-gradient(145deg,#8c4cc4,#4b2380)' },
  { key: 'haldi', label: 'Haldi & Mehendi', eyebrow: 'HALDI & MEHENDI', title: 'Sunny yellows and fresh greens',
    blurb: 'Bright, comfortable cottons made for the day.', gradient: 'linear-gradient(145deg,#e0b13a,#a8791a)' },
  { key: 'office', label: 'Office', eyebrow: 'OFFICE & EVERYDAY', title: 'Light cottons you can wear all day',
    blurb: 'Easy drapes that stay fresh from morning to evening.', gradient: 'linear-gradient(145deg,#1d7a63,#0d4638)' },
  { key: 'gifting', label: 'Gifting', eyebrow: 'GIFTING', title: 'Thoughtful picks, ready to gift',
    blurb: 'Sarees and jewellery she will actually wear.', gradient: 'linear-gradient(145deg,#e0628a,#a82a5a)' },
];

export const OCCASION_BY_KEY: Record<string, Occasion> = Object.fromEntries(OCCASIONS.map((o) => [o.key, o]));

// "Shop by price" tiles — each opens /collection/<slug>
export const BUDGET_TILES = [
  { slug: 'under-499', label: 'Under ₹499', caption: 'Pocket-friendly', bg: 'linear-gradient(145deg,#ff8a78,#e2503f)', color: '#fff' },
  { slug: 'under-699', label: 'Under ₹699', caption: 'Everyday value', bg: 'linear-gradient(145deg,#1d7a63,#0d4638)', color: '#fff' },
  { slug: 'under-999', label: 'Under ₹999', caption: 'Best combos', bg: 'linear-gradient(145deg,#8c4cc4,#4b2380)', color: '#fff' },
  { slug: '999-and-up', label: '₹999 & up', caption: 'Gifts & festive', bg: 'linear-gradient(145deg,#e0b13a,#c99a2a)', color: '#5C1010' },
];
