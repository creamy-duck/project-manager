import { defineStore } from 'pinia'
import { ref } from 'vue'
import { post } from '@/lib/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
  const token = ref(localStorage.getItem('token') || null)

  function setAuth(newToken: string, newUser: any) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  async function signup(username: string, email: string, password: string) {
    const data = await post<{ token: string; user: any }>('/auth/register', {
      username,
      email,
      password,
    })

    setAuth(data.token, data.user)
    return data
  }

  async function login(email: string, password: string) {
    const data = await post<{ token: string; user: any }>('/auth/login', {
      email,
      password,
    })

    setAuth(data.token, data.user)
    return data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { user, token, signup, login, logout }
})