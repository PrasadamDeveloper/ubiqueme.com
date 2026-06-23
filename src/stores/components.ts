import { defineStore } from 'pinia'

type ComponentName = 'Mis QR' | 'Configuración' | 'Cerrar Sesión' | 'Soporte' | 'Planes'

export const useComponentsStore = defineStore('componentsStore', {
  state: () => ({
    currentComponentName: 'Mis QR' as ComponentName,
  }),

  actions: {
    changeComponent(componentName: ComponentName) {
      this.currentComponentName = componentName
    },
  },

  getters: {
    getCurrentComponent: (state) => state.currentComponentName,
  },
})
