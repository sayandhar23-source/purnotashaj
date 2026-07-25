import {
  FestiveSaleArt, NormalDayArt, IndependenceDayArt, DurgaPujaArt,
  DiwaliArt, NewYearArt, BridalArt, MonsoonArt, SummerArt, WinterArt,
  ValentineArt, HoliArt, EidArt, ChristmasArt,
  MegaSaleArt, NewArrivalsArt, FreeShippingArt, BestSellersArt, VipArt,
} from './artwork';

export type SaleBannerTemplateId =
  | 'festive-sale' | 'normal-day' | 'independence-day' | 'durga-puja'
  | 'diwali' | 'new-year' | 'bridal' | 'monsoon' | 'summer' | 'winter'
  | 'valentine' | 'holi' | 'eid' | 'christmas'
  | 'mega-sale' | 'new-arrivals' | 'free-shipping' | 'best-sellers' | 'vip';

export const SALE_BANNER_TEMPLATES: Record<
  SaleBannerTemplateId,
  {
    label: string;
    leftBg: string;
    titleColor: string;
    subtitleColor: string;
    eyebrowColor: string;
    ctaBg: string;
    ctaText: string;
    eyebrow: string;
    Art: React.ComponentType;
  }
> = {
  'festive-sale': {
    label: 'Festive Sale (Jagannath)',
    leftBg: '#5C1010', titleColor: '#F5EEE0', subtitleColor: '#E8C88A', eyebrowColor: '#D4A024',
    ctaBg: '#D4A024', ctaText: '#5C1010', eyebrow: 'FESTIVE SPECIAL', Art: FestiveSaleArt,
  },
  'normal-day': {
    label: 'Everyday (No Sale)',
    leftBg: '#FBF1E7', titleColor: '#3D2417', subtitleColor: '#8A5A34', eyebrowColor: '#B3652E',
    ctaBg: '#C87A3D', ctaText: '#FFFFFF', eyebrow: 'NEW THIS WEEK', Art: NormalDayArt,
  },
  'independence-day': {
    label: 'Independence Day Sale',
    leftBg: '#FFFFFF', titleColor: '#1A1A1A', subtitleColor: '#4A4A4A', eyebrowColor: '#FF9933',
    ctaBg: '#138808', ctaText: '#FFFFFF', eyebrow: 'INDEPENDENCE DAY', Art: IndependenceDayArt,
  },
  'durga-puja': {
    label: 'Durga Puja Special',
    leftBg: '#6E0E1F', titleColor: '#FDF1DD', subtitleColor: '#E8C88A', eyebrowColor: '#E8B93D',
    ctaBg: '#E8B93D', ctaText: '#6E0E1F', eyebrow: 'SHUBHO MAHALAYA', Art: DurgaPujaArt,
  },
  'diwali': {
    label: 'Diwali Sale',
    leftBg: '#0B1D3A', titleColor: '#F5EEE0', subtitleColor: '#B8C4D9', eyebrowColor: '#D4A024',
    ctaBg: '#D4A024', ctaText: '#0B1D3A', eyebrow: 'FESTIVAL OF LIGHTS', Art: DiwaliArt,
  },
  'new-year': {
    label: 'New Year Sale',
    leftBg: '#111111', titleColor: '#F5EEE0', subtitleColor: '#B0AFAC', eyebrowColor: '#D4A024',
    ctaBg: '#D4A024', ctaText: '#111111', eyebrow: 'NEW YEAR, NEW STYLE', Art: NewYearArt,
  },
  'bridal': {
    label: 'Wedding / Bridal Collection',
    leftBg: '#F7E3E0', titleColor: '#5A2A32', subtitleColor: '#8A5560', eyebrowColor: '#B5657A',
    ctaBg: '#C08A5A', ctaText: '#FFFFFF', eyebrow: 'BRIDAL EDIT', Art: BridalArt,
  },
  'monsoon': {
    label: 'Monsoon Sale',
    leftBg: '#0F4C4C', titleColor: '#F5EEE0', subtitleColor: '#B9DEDE', eyebrowColor: '#8FD6D6',
    ctaBg: '#F4A623', ctaText: '#0F4C4C', eyebrow: 'MONSOON EDIT', Art: MonsoonArt,
  },
  'summer': {
    label: 'Summer Collection',
    leftBg: '#E85D3D', titleColor: '#F5EEE0', subtitleColor: '#FBD9C9', eyebrowColor: '#F4C430',
    ctaBg: '#F4C430', ctaText: '#E85D3D', eyebrow: 'SUMMER EDIT', Art: SummerArt,
  },
  'winter': {
    label: 'Winter Collection',
    leftBg: '#1B3A5C', titleColor: '#F5EEE0', subtitleColor: '#B9D4EA', eyebrowColor: '#9FC9EA',
    ctaBg: '#DCEEFB', ctaText: '#1B3A5C', eyebrow: 'WINTER EDIT', Art: WinterArt,
  },
  'valentine': {
    label: "Valentine's Day",
    leftBg: '#7A1F2B', titleColor: '#F5EEE0', subtitleColor: '#F0C4CE', eyebrowColor: '#F0A8B8',
    ctaBg: '#F0A8B8', ctaText: '#7A1F2B', eyebrow: 'FOR SOMEONE SPECIAL', Art: ValentineArt,
  },
  'holi': {
    label: 'Holi Sale',
    leftBg: '#FFF8F0', titleColor: '#3D2417', subtitleColor: '#8A5A34', eyebrowColor: '#E85D3D',
    ctaBg: '#2E7D6B', ctaText: '#FFFFFF', eyebrow: 'FESTIVAL OF COLORS', Art: HoliArt,
  },
  'eid': {
    label: 'Eid Sale',
    leftBg: '#0F3D2E', titleColor: '#F5EEE0', subtitleColor: '#B8D4C8', eyebrowColor: '#D4A024',
    ctaBg: '#D4A024', ctaText: '#0F3D2E', eyebrow: 'EID MUBARAK', Art: EidArt,
  },
  'christmas': {
    label: 'Christmas Sale',
    leftBg: '#0D3320', titleColor: '#F5EEE0', subtitleColor: '#B8D4C8', eyebrowColor: '#D4A024',
    ctaBg: '#D4A024', ctaText: '#0D3320', eyebrow: "SEASON'S GREETINGS", Art: ChristmasArt,
  },
  'mega-sale': {
    label: 'Mega Sale / Clearance',
    leftBg: '#111111', titleColor: '#F5EEE0', subtitleColor: '#B0AFAC', eyebrowColor: '#F4C430',
    ctaBg: '#F4C430', ctaText: '#111111', eyebrow: 'LIMITED TIME', Art: MegaSaleArt,
  },
  'new-arrivals': {
    label: 'New Arrivals',
    leftBg: '#F4F1E8', titleColor: '#3D2E1F', subtitleColor: '#7A6A54', eyebrowColor: '#5C7A5C',
    ctaBg: '#5C7A5C', ctaText: '#FFFFFF', eyebrow: 'JUST LANDED', Art: NewArrivalsArt,
  },
  'free-shipping': {
    label: 'Free Shipping',
    leftBg: '#1E3A8A', titleColor: '#F5EEE0', subtitleColor: '#C4D2F0', eyebrowColor: '#B8C9F5',
    ctaBg: '#F4C430', ctaText: '#1E3A8A', eyebrow: 'ON ALL ORDERS', Art: FreeShippingArt,
  },
  'best-sellers': {
    label: 'Best Sellers',
    leftBg: '#B3502E', titleColor: '#F5EEE0', subtitleColor: '#F0CFB8', eyebrowColor: '#F4C430',
    ctaBg: '#F4C430', ctaText: '#B3502E', eyebrow: 'CUSTOMER FAVORITES', Art: BestSellersArt,
  },
  'vip': {
    label: 'VIP / Members Exclusive',
    leftBg: '#0D0D0D', titleColor: '#F5EEE0', subtitleColor: '#B0AFAC', eyebrowColor: '#D4A024',
    ctaBg: '#D4A024', ctaText: '#0D0D0D', eyebrow: 'MEMBERS ONLY', Art: VipArt,
  },
};
