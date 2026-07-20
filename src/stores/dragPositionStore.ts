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

export const useDragPositionStore = defineStore(
  'dragPositionStore',
  () => {
    // Keyed by QR id → { sm: [...], md: [...], lg: [...] }
    const configs = ref<Record<string, SizeConfig>>({})

    // ─── Getters ────────────────────────────────────────────────

    function getImages(qrId: string, size: SizeKey): DragImageData[] {
      if (!configs.value[qrId]) return []
      return configs.value[qrId][size] ?? []
    }

    function hasConfig(qrId: string): boolean {
      return !!configs.value[qrId]
    }

    // ─── Actions ────────────────────────────────────────────────

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
    }

    return {
      configs,
      getImages,
      hasConfig,
      addImage,
      updateOffset,
      resizeImage,
      removeImage,
      resetSize,
      clearConfig,
    }
  },
  {
    persist: {
      // Only persist configs
      pick: ['configs'],
    },
  },
)
