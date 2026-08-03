import {
  LotusDivider, MarigoldDivider, PeacockDivider, MandalaDivider, HennaDivider,
  DiyaDivider, BelPatraDivider, TempleBellDivider, SwastikaDivider,
} from './index';

export type DividerId =
  | 'lotus' | 'marigold' | 'peacock' | 'mandala' | 'henna'
  | 'diya' | 'bel-patra' | 'temple-bell' | 'swastika' | 'none';

export const DIVIDERS: Record<Exclude<DividerId, 'none'>, { label: string; Component: React.ComponentType }> = {
  'lotus': { label: 'Layered Lotus', Component: LotusDivider },
  'marigold': { label: 'Marigold', Component: MarigoldDivider },
  'peacock': { label: 'Peacock Feather', Component: PeacockDivider },
  'mandala': { label: 'Mandala Medallion', Component: MandalaDivider },
  'henna': { label: 'Henna / Mehndi Swirl', Component: HennaDivider },
  'diya': { label: 'Diya', Component: DiyaDivider },
  'bel-patra': { label: 'Bel Patra', Component: BelPatraDivider },
  'temple-bell': { label: 'Temple Bell', Component: TempleBellDivider },
  'swastika': { label: 'Swastika', Component: SwastikaDivider },
};
