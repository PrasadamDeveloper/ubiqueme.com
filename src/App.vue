<script lang="ts" setup>
import { onMounted } from 'vue'
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import 'animate.css'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

const userStore = useUserStore()
const db = getFirestore()

onMounted(() => {
  // Escuchar cambios en el estado de autenticación de Firebase
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // El usuario está autenticado
      userStore.setIsAuthenticated(true)
      userStore.setUserId(user.uid)
      userStore.setEmail(user.email || '')
      if (user.displayName) userStore.setFullName(user.displayName)

      // Obtener el documento del usuario para leer el role y otros campos
      try {
        const userDocRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userDocRef)
        if (userSnap.exists()) {
          const userData = userSnap.data()
          if (userData.role) userStore.setRole(userData.role)
        }
      } catch (e) {
        console.warn('[App.vue] Error fetching user doc for role:', e)
      }
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
