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
  lg: {
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
      offsets: { left: 647, top: 416 },
      width: 47,
      height: 48,
    },
    {
      id: 'userImg-5',
      asset: '@/assets/drag-images/social-5.webp',
      offsets: { left: 592, top: 417 },
      width: 43,
      height: 45,
    },
    {
      id: 'userImg-6',
      asset: '@/assets/drag-images/social-6.webp',
      offsets: { left: 538, top: 418 },
      width: 44,
      height: 42,
    },
    {
      id: 'userImg-7',
      asset: '@/assets/drag-images/social-7.webp',
      offsets: { left: 488, top: 421 },
      width: 42,
      height: 40,
    },
    {
      id: 'userImg-8',
      asset: '@/assets/drag-images/social-8.webp',
      offsets: { left: 434, top: 420 },
      width: 40,
      height: 41,
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
  ],
  lg: [],
}
