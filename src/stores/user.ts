import { defineStore } from 'pinia'
import 'pinia-plugin-persistedstate'
import { ref, computed } from 'vue'

export const useUserStore = defineStore(
  'userStore',
  () => {
    // State
    const fullName = ref('')
    const creationDate = ref('')
    const userId = ref('')
    const email = ref('')
    const userPhone = ref('')
    const role = ref('')
    const isAuthenticated = ref(false)
    const authReady = ref(false)

    // Getters
    const getFullName = computed(() => fullName.value)
    const getFirstName = computed(() => fullName.value.split(' ')[0] || '')
    const getCreationDate = computed(() => creationDate.value)
    const getUserId = computed(() => userId.value)
    const getEmail = computed(() => email.value)
    const getUserPhone = computed(() => userPhone.value)
    const getRole = computed(() => role.value)
    const getIsAuthenticated = computed(() => isAuthenticated.value)
    const isAuthReady = computed(() => authReady.value)

    // Actions
    function setFullName(val: string) {
      fullName.value = val
    }
    function setUserId(id: string) {
      userId.value = id
    }
    function setCreationDate(date: string) {
      creationDate.value = date
    }
    function setEmail(val: string) {
      email.value = val
    }
    function setUserPhone(val: string) {
      userPhone.value = val
    }
    function setRole(val: string) {
      role.value = val
    }
    function setIsAuthenticated(val: boolean) {
      isAuthenticated.value = val
    }
    function setAuthReady(val: boolean) {
      authReady.value = val
    }
    function clearFullName() {
      fullName.value = ''
    }
    function clearUser() {
      fullName.value = ''
      creationDate.value = ''
      userId.value = ''
      email.value = ''
      userPhone.value = ''
      role.value = ''
      isAuthenticated.value = false
    }

    return {
      // State
      fullName,
      creationDate,
      userId,
      email,
      userPhone,
      role,
      isAuthenticated,
      authReady,
      // Getters
      getFullName,
      getFirstName,
      getCreationDate,
      getUserId,
      getEmail,
      getUserPhone,
      getRole,
      getIsAuthenticated,
      isAuthReady,
      // Actions
      setFullName,
      setUserId,
      setCreationDate,
      setEmail,
      setUserPhone,
      setRole,
      setIsAuthenticated,
      setAuthReady,
      clearFullName,
      clearUser,
    }
  },
  {
    persist: true,
  },
)
