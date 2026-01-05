import {defineStore} from 'pinia'
import {computed, ref} from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('token'))
    const user = ref<any | null>(JSON.parse(localStorage.getItem('user') || 'null'))
    
    const isAuthenticated = computed(() => !!token.value)

    function setAuth(newToken: string, userData: any) {
        token.value = newToken
        user.value = userData
        
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return {
        token: token,
        user,
        isAuthenticated,
        setAuth,
        logout,
    }
})