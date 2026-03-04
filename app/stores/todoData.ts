import { defineStore } from 'pinia'

export interface DummyTodo {
  id: number
  todo: string
  completed: boolean
  userId: number
  [key: string]: unknown
}

export type TodoSlot = 1 | 2

export interface TodoDataState {
  todo: DummyTodo | null
  currentSlot: TodoSlot | null
  todosBySlot: Partial<Record<TodoSlot, DummyTodo>>
  error: string | null
  lastFetchedAtBySlot: Partial<Record<TodoSlot, string>>
  requestCount: number
}

export const useTodoDataStore = defineStore('todoData', {
  state: (): TodoDataState => ({
    todo: null,
    currentSlot: null,
    todosBySlot: {},
    error: null,
    lastFetchedAtBySlot: {},
    requestCount: 0
  }),

  getters: {
    hasData: state => state.todo !== null,
    hasTodoBySlot: state => (slot: TodoSlot) => Boolean(state.todosBySlot[slot])
  },

  actions: {
    setTodoForSlot(payload: unknown, slot: TodoSlot) {
      const normalizedTodo = payload as DummyTodo

      this.todo = normalizedTodo
      this.currentSlot = slot
      this.todosBySlot[slot] = normalizedTodo
      this.lastFetchedAtBySlot[slot] = new Date().toISOString()
      this.error = null
      this.requestCount += 1
    },

    setCurrentTodoFromCache(slot: TodoSlot) {
      const cachedTodo = this.todosBySlot[slot]

      if (!cachedTodo) {
        return false
      }

      this.todo = cachedTodo
      this.currentSlot = slot
      this.error = null
      return true
    },

    setError(message: string) {
      this.error = message
      this.requestCount += 1
    },

    clear() {
      this.todo = null
      this.currentSlot = null
      this.todosBySlot = {}
      this.error = null
      this.lastFetchedAtBySlot = {}
    }
  }
})
