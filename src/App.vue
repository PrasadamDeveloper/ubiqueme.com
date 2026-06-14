<script lang="ts" setup>
import { onMounted } from 'vue'
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useUserStore } from '@/stores/user'
import 'animate.css'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

const userStore = useUserStore()

onMounted(() => {
  // Escuchar cambios en el estado de autenticación de Firebase
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // El usuario está autenticado
      userStore.setIsAuthenticated(true)
      userStore.setUserId(user.uid)
      userStore.setEmail(user.email || '')
      if (user.displayName) userStore.setFullName(user.displayName)
    } else {
      // El usuario no está autenticado o cerró sesión
      userStore.clearUser()
    }
    // Marcar que el estado inicial de auth ha sido verificado
    userStore.setAuthReady(true)
  })
})

</script>

<template>
  <Toaster position="top-left" richColors />
  <router-view />
</template>

<style scoped></style>
