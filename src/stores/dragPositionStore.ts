import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface DragImageData {
  id: string
  dataUrl: string
  offsets: { left: number; top: number }
  width: number
  height: number
}

export type SizeKey = 'sm' | 'md' | 'lg'

export interface SizeConfig {
  sm: DragImageData[]
  md: DragImageData[]
  lg: DragImageData[]
}

export interface ElementOffsets {
  logo: { left: number; top: number }
  topDomain: { left: number; top: number }
  qrBox: { left: number; top: number }
  name: { left: number; top: number }
  id: { left: number; top: number }
  desc1: { left: number; top: number }
  desc2: { left: number; top: number }
  bottomDomains: { left: number; top: number }
}

export interface ElementOffsetsBySize {
  sm: ElementOffsets
  md: ElementOffsets
  lg: ElementOffsets
}

const DEFAULT_OFFSETS: ElementOffsets = {
  logo: { left: 0, top: 0 },
  topDomain: { left: 0, top: 0 },
  qrBox: { left: 0, top: 0 },
  name: { left: 0, top: 0 },
  id: { left: 0, top: 0 },
  desc1: { left: 0, top: 0 },
  desc2: { left: 0, top: 0 },
  bottomDomains: { left: 0, top: 0 },
}

export const useDragPositionStore = defineStore(
  'dragPositionStore',
  () => {
    // Images: keyed by QR id → { sm: [...], md: [...], lg: [...] }
    const configs = ref<Record<string, SizeConfig>>({})

    // Element offsets: keyed by QR id → { sm: {...}, md: {...}, lg: {...} }
    const savedElementOffsets = ref<Record<string, ElementOffsetsBySize>>({})

    // ─── Getters — Images ───────────────────────────────────────

    function getImages(qrId: string, size: SizeKey): DragImageData[] {
      if (!configs.value[qrId]) return []
      return configs.value[qrId][size] ?? []
    }

    function hasConfig(qrId: string): boolean {
      return !!configs.value[qrId]
    }

    // ─── Getters — Element Offsets ──────────────────────────────

    function getSavedElementOffsets(qrId: string, size: SizeKey): ElementOffsets | null {
      const entry = savedElementOffsets.value[qrId]
      if (!entry) return null
      return entry[size] ?? null
    }

    function hasSavedElementOffsets(qrId: string): boolean {
      return !!savedElementOffsets.value[qrId]
    }

    // ─── Actions — Images ───────────────────────────────────────

    function ensureConfig(qrId: string) {
      if (!configs.value[qrId]) {
        configs.value[qrId] = { sm: [], md: [], lg: [] }
      }
    }

    function addImage(qrId: string, size: SizeKey, data: DragImageData) {
      ensureConfig(qrId)
      configs.value[qrId]![size].push({ ...data })
    }

    function updateOffset(qrId: string, size: SizeKey, imgId: string, left: number, top: number) {
      const imgs = configs.value[qrId]?.[size]
      if (!imgs) return
      const img = imgs.find((i: DragImageData) => i.id === imgId)
      if (img) {
        img.offsets.left = left
        img.offsets.top = top
      }
    }

    function resizeImage(
      qrId: string,
      size: SizeKey,
      imgId: string,
      width: number,
      height: number,
    ) {
      const imgs = configs.value[qrId]?.[size]
      if (!imgs) return
      const img = imgs.find((i: DragImageData) => i.id === imgId)
      if (img) {
        img.width = Math.max(10, width)
        img.height = Math.max(10, height)
      }
    }

    function removeImage(qrId: string, size: SizeKey, imgId: string) {
      const imgs = configs.value[qrId]?.[size]
      if (!imgs) return
      configs.value[qrId][size] = imgs.filter((i: DragImageData) => i.id !== imgId)
    }

    function resetSize(qrId: string, size: SizeKey) {
      if (configs.value[qrId]) {
        configs.value[qrId]![size] = []
      }
    }

    function clearConfig(qrId: string) {
      delete configs.value[qrId]
      delete savedElementOffsets.value[qrId]
    }

    // ─── Actions — Element Offsets ──────────────────────────────

    function saveElementOffsets(qrId: string, size: SizeKey, offsets: ElementOffsets) {
      if (!savedElementOffsets.value[qrId]) {
        savedElementOffsets.value[qrId] = {
          sm: { ...DEFAULT_OFFSETS },
          md: { ...DEFAULT_OFFSETS },
          lg: { ...DEFAULT_OFFSETS },
        }
      }
      savedElementOffsets.value[qrId]![size] = JSON.parse(JSON.stringify(offsets))
    }

    return {
      configs,
      savedElementOffsets,
      getImages,
      hasConfig,
      addImage,
      updateOffset,
      resizeImage,
      removeImage,
      resetSize,
      clearConfig,
      getSavedElementOffsets,
      hasSavedElementOffsets,
      saveElementOffsets,
    }
  },
  {
    persist: {
      pick: ['configs', 'savedElementOffsets'],
    },
  },
)
