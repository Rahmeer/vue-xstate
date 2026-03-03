import { defineStore } from 'pinia'

export interface DummyUser {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  [key: string]: unknown
}

export interface ApiDataState {
  user: DummyUser | null
  currentUserId: number | null
  usersById: Record<number, DummyUser>
  error: string | null
  lastFetchedAt: string | null
  requestCount: number
}

export const useApiDataStore = defineStore('apiData', {
  state: (): ApiDataState => ({
    user: null,
    currentUserId: null,
    usersById: {},
    error: null,
    lastFetchedAt: null,
    requestCount: 0
  }),

  getters: {
    hasData: state => state.user !== null,
    hasUserById: state => (userId: number) => Boolean(state.usersById[userId])
  },

  actions: {
    setUser(payload: unknown, userId: number) {
      const normalizedUser = payload as DummyUser

      this.user = normalizedUser
      this.currentUserId = userId
      this.usersById[userId] = normalizedUser
      this.error = null
      this.lastFetchedAt = new Date().toISOString()
      this.requestCount += 1
    },

    setCurrentUserFromCache(userId: number) {
      const cachedUser = this.usersById[userId]

      if (!cachedUser) {
        return false
      }

      this.user = cachedUser
      this.currentUserId = userId
      this.error = null
      return true
    },

    setError(message: string) {
      this.error = message
      this.requestCount += 1
    },

    clear() {
      this.user = null
      this.currentUserId = null
      this.usersById = {}
      this.error = null
      this.lastFetchedAt = null
    }
  }
})
