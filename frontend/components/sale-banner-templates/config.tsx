import { FestiveSaleArt, NormalDayArt, IndependenceDayArt, DurgaPujaArt } from './artwork';

export type SaleBannerTemplateId = 'festive-sale' | 'normal-day' | 'independence-day' | 'durga-puja';

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
    leftBg: '#5C1010',
    titleColor: '#F5EEE0',
    subtitleColor: '#E8C88A',
    eyebrowColor: '#D4A024',
    ctaBg: '#D4A024',
    ctaText: '#5C1010',
    eyebrow: 'FESTIVE SPECIAL',
    Art: FestiveSaleArt,
  },
  'normal-day': {
    label: 'Everyday (No Sale)',
    leftBg: '#FBF1E7',
    titleColor: '#3D2417',
    subtitleColor: '#8A5A34',
    eyebrowColor: '#B3652E',
    ctaBg: '#C87A3D',
    ctaText: '#FFFFFF',
    eyebrow: 'NEW THIS WEEK',
    Art: NormalDayArt,
  },
  'independence-day': {
    label: 'Independence Day Sale',
    leftBg: '#FFFFFF',
    titleColor: '#1A1A1A',
    subtitleColor: '#4A4A4A',
    eyebrowColor: '#FF9933',
    ctaBg: '#138808',
    ctaText: '#FFFFFF',
    eyebrow: 'INDEPENDENCE DAY',
    Art: IndependenceDayArt,
  },
  'durga-puja': {
    label: 'Durga Puja Special',
    leftBg: '#6E0E1F',
    titleColor: '#FDF1DD',
    subtitleColor: '#E8C88A',
    eyebrowColor: '#E8B93D',
    ctaBg: '#E8B93D',
    ctaText: '#6E0E1F',
    eyebrow: 'SHUBHO MAHALAYA',
    Art: DurgaPujaArt,
  },
};
