type SizeKey = 'sm' | 'md' | 'lg'

/**
 * Default element offsets for each size.
 * These are the final hardcoded values (no Pinia, no Firebase).
 */
export const DEFAULT_ELEMENT_OFFSETS = {
  sm: {
    logo: { left: 0, top: 0 },
    topDomain: { left: 0, top: 0 },
    qrBox: { left: 0, top: 0 },
    name: { left: 0, top: 0 },
    id: { left: 0, top: 0 },
    desc1: { left: 0, top: 0 },
    desc2: { left: 0, top: 0 },
    bottomDomains: { left: 0, top: 0 },
    bottomEmail: { left: 0, top: 0 },
  },
  md: {
    logo: { left: 1, top: -3 },
    topDomain: { left: 2, top: -1 },
    qrBox: { left: 4, top: 1 },
    name: { left: -19, top: -27 },
    id: { left: -11, top: -20 },
    desc1: { left: 16, top: 10 },
    desc2: { left: 4, top: 14 },
    bottomDomains: { left: -149, top: -9 },
    bottomEmail: { left: -186, top: -13 },
  },
  // lg — element offsets
  lg: {
    logo: { left: 2, top: -5 },
    topDomain: { left: 3, top: -24 },
    qrBox: { left: 6, top: 2 },
    name: { left: -1, top: -4 },
    id: { left: -532, top: 277 },
    desc1: { left: 17, top: -24 },
    desc2: { left: 7, top: -2 },
    bottomDomains: { left: -231, top: 12 },
    bottomEmail: { left: -286, top: 21 },
  },
} as const

export interface DragImageMeta {
  id: string
  /** Path to the asset file — you must place files here */
  asset: string
  offsets: { left: number; top: number }
  width: number
  height: number
}

/**
 * Default user images for each size.
 * Place the actual .webp files in /src/assets/drag-images/
 * with the names listed below.
 */
export const DEFAULT_USER_IMAGES: Record<SizeKey, DragImageMeta[]> = {
  sm: [],
  md: [
    {
      id: 'userImg-4',
      asset: '@/assets/drag-images/social-4.webp',
      offsets: { left: 651, top: 418 },
      width: 39,
      height: 40,
    },
    {
      id: 'userImg-5',
      asset: '@/assets/drag-images/social-5.webp',
      offsets: { left: 609, top: 419 },
      width: 36,
      height: 38,
    },
    {
      id: 'userImg-6',
      asset: '@/assets/drag-images/social-6.webp',
      offsets: { left: 565, top: 420 },
      width: 37,
      height: 35,
    },
    {
      id: 'userImg-7',
      asset: '@/assets/drag-images/social-7.webp',
      offsets: { left: 523, top: 421 },
      width: 35,
      height: 33,
    },
    {
      id: 'userImg-8',
      asset: '@/assets/drag-images/social-8.webp',
      offsets: { left: 481, top: 419 },
      width: 33,
      height: 34,
    },
    {
      id: 'userImg-9',
      asset: '@/assets/drag-images/social-9.webp',
      offsets: { left: 436, top: 420 },
      width: 36,
      height: 36,
    },
    {
      id: 'userImg-10',
      asset: '@/assets/drag-images/social-10.webp',
      offsets: { left: -23, top: -12 },
      width: 83,
      height: 65,
    },
    {
      id: 'userImg-12',
      asset: '@/assets/drag-images/social-12.webp',
      offsets: { left: 123, top: 190 },
      width: 74,
      height: 66,
    },
    {
      id: 'userImg-13',
      asset: '@/assets/drag-images/social-13.webp',
      offsets: { left: 320, top: 10 },
      width: 80,
      height: 80,
    },
  ],
  lg: [
    {
      id: 'userImg-4',
      asset: '@/assets/drag-images/social-4.webp',
      offsets: { left: 977, top: 627 },
      width: 59,
      height: 60,
    },
    {
      id: 'userImg-5',
      asset: '@/assets/drag-images/social-5.webp',
      offsets: { left: 914, top: 628 },
      width: 54,
      height: 57,
    },
    {
      id: 'userImg-6',
      asset: '@/assets/drag-images/social-6.webp',
      offsets: { left: 849, top: 628 },
      width: 55,
      height: 53,
    },
    {
      id: 'userImg-7',
      asset: '@/assets/drag-images/social-7.webp',
      offsets: { left: 785, top: 630 },
      width: 53,
      height: 50,
    },
    {
      id: 'userImg-8',
      asset: '@/assets/drag-images/social-8.webp',
      offsets: { left: 721, top: 629 },
      width: 50,
      height: 52,
    },
    {
      id: 'userImg-9',
      asset: '@/assets/drag-images/social-9.webp',
      offsets: { left: 654, top: 629 },
      width: 54,
      height: 54,
    },
    {
      id: 'userImg-10',
      asset: '@/assets/drag-images/social-10.webp',
      offsets: { left: -35, top: -18 },
      width: 125,
      height: 98,
    },
    {
      id: 'userImg-12',
      asset: '@/assets/drag-images/social-12.webp',
      offsets: { left: 185, top: 285 },
      width: 111,
      height: 99,
    },
    {
      id: 'userImg-13',
      asset: '@/assets/drag-images/social-13.webp',
      offsets: { left: 458, top: 15 },
      width: 120,
      height: 120,
    },
  ],
}
