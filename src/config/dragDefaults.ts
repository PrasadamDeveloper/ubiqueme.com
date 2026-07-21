type SizeKey = 'sm' | 'md' | 'lg'

/**
 * Default element offsets for each size.
 * These are the final hardcoded values (no Pinia, no Firebase).
 */
export const DEFAULT_ELEMENT_OFFSETS = {
  // sm — element offsets
  sm: {
    logo: { left: -1, top: 1 },
    httpsLabel: { left: 0, top: 0 },
    topDomain: { left: 0, top: -5 },
    qrBox: { left: -1, top: 8 },
    name: { left: -20, top: 11 },
    id: { left: -200, top: 93 },
    desc1: { left: -32, top: -15 },
    desc2: { left: -41, top: -22 },
    bottomDomains: { left: 0, top: 0 },
    bottomEmail: { left: 0, top: 0 },
  },
  // md — element offsets
  md: {
    logo: { left: -4, top: -4 },
    httpsLabel: { left: -216, top: 39 },
    topDomain: { left: 45, top: -15 },
    qrBox: { left: 4, top: 1 },
    name: { left: -8, top: -20 },
    id: { left: -364, top: 187 },
    desc1: { left: 2, top: -44 },
    desc2: { left: 3, top: -37 },
    bottomDomains: { left: -146, top: -9 },
    bottomEmail: { left: -183, top: 4 },
  },
  // lg — element offsets
  lg: {
    logo: { left: 2, top: -5 },
    httpsLabel: { left: -288, top: 41 },
    topDomain: { left: 95, top: -33 },
    qrBox: { left: 6, top: 2 },
    name: { left: -3, top: -20 },
    id: { left: -532, top: 277 },
    desc1: { left: 17, top: -29 },
    desc2: { left: 8, top: -24 },
    bottomDomains: { left: -231, top: -4 },
    bottomEmail: { left: -286, top: 11 },
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
  // sm — user image offsets
  sm: [
    {
      id: 'userImg-4',
      asset: '@/assets/drag-images/social-4.webp',
      offsets: { left: 304, top: 138 },
      width: 21,
      height: 22,
    },
    {
      id: 'userImg-5',
      asset: '@/assets/drag-images/social-5.webp',
      offsets: { left: 331, top: 140 },
      width: 20,
      height: 21,
    },
    {
      id: 'userImg-6',
      asset: '@/assets/drag-images/social-6.webp',
      offsets: { left: 359, top: 140 },
      width: 20,
      height: 19,
    },
    {
      id: 'userImg-7',
      asset: '@/assets/drag-images/social-7.webp',
      offsets: { left: 332, top: 116 },
      width: 19,
      height: 18,
    },
    {
      id: 'userImg-8',
      asset: '@/assets/drag-images/social-8.webp',
      offsets: { left: 305, top: 116 },
      width: 18,
      height: 19,
    },
    {
      id: 'userImg-9',
      asset: '@/assets/drag-images/social-9.webp',
      offsets: { left: 361, top: 116 },
      width: 20,
      height: 20,
    },
    {
      id: 'userImg-10',
      asset: '@/assets/drag-images/social-10.webp',
      offsets: { left: -21, top: -16 },
      width: 46,
      height: 36,
    },
    {
      id: 'userImg-12',
      asset: '@/assets/drag-images/social-12.webp',
      offsets: { left: 41, top: 71 },
      width: 41,
      height: 36,
    },
  ],

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
      offsets: { left: -19, top: -12 },
      width: 83,
      height: 65,
    },
    {
      id: 'userImg-12',
      asset: '@/assets/drag-images/social-12.webp',
      offsets: { left: 125, top: 217 },
      width: 74,
      height: 66,
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
      offsets: { left: -12, top: -20 },
      width: 125,
      height: 98,
    },
    {
      id: 'userImg-12',
      asset: '@/assets/drag-images/social-12.webp',
      offsets: { left: 182, top: 340 },
      width: 111,
      height: 99,
    },
  ],
}
