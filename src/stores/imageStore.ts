import { defineStore } from 'pinia'
import { api as viewerApi } from 'v-viewer'
export const useImageStore = defineStore('useImageStore', {
  state: () => ({
    images: [] as string[],
  }),

  actions: {
    setImages(newImage: string) {
      this.images.push(newImage)
    },

    clearImages() {
      this.images = []
    },

    showImage() {
      if (!this.images.length) return
      viewerApi({
        images: this.images,
      })
    },
  },

  getters: {
    getImages: (state) => state.images,
  },
})
