import { assign, fromPromise, setup } from 'xstate'
import type { TodoSlot } from '~/stores/todoData'

const TODOS_RANDOM_URL = 'https://dummyjson.com/todos/random'
const CACHE_REFRESH_DELAY_MS = 5000

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface TodoStoreContract {
  setTodoForSlot: (payload: unknown, slot: TodoSlot) => void
  setCurrentTodoFromCache: (slot: TodoSlot) => boolean
  hasTodoBySlot: (slot: TodoSlot) => boolean
  setError: (message: string) => void
  clear: () => void
}

interface DummyTodoResponse {
  id: number
  todo: string
  completed: boolean
  userId: number
  [key: string]: unknown
}

export function createTodoMachine(store: TodoStoreContract) {
  return setup({
    types: {
      context: {} as { slot: TodoSlot | null }
    },
    actors: {
      loadRandomTodo: fromPromise<DummyTodoResponse, { delayMs: number }>(async ({ input }) => {
        if (input.delayMs > 0) {
          await sleep(input.delayMs)
        }

        return await $fetch(TODOS_RANDOM_URL)
      })
    },
    actions: {
      setSlotFromEvent: assign({
        slot: ({ event }) =>
          event.type === 'FETCH' ? event.slot : null
      }),
      setTodoFromCache: ({ context }) => {
        if (context.slot !== null) {
          store.setCurrentTodoFromCache(context.slot)
        }
      },
      saveResultToStore: ({ event, context }) => {
        if (event.type === 'xstate.done.actor.loadRandomTodo' && context.slot !== null) {
          store.setTodoForSlot(event.output, context.slot)
        }
      },
      saveErrorToStore: ({ event }) => {
        if (event.type === 'xstate.error.actor.loadRandomTodo') {
          const message = event.error instanceof Error ? event.error.message : 'Request failed'
          store.setError(message)
        }
      },
      resetStore: () => {
        store.clear()
      }
    },
    guards: {
      hasCachedTodo: ({ context }) => context.slot !== null && store.hasTodoBySlot(context.slot)
    }
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FUFoA2qCGEYATgHQCWE2YAxAGICiAKgMIASA2gAwC6ioADqlhlkZVADs+IAB6IAjJ04AOEgFYA7EuUA2AJwBmbQCZdS-QBoQAT0QAWbapLrl+-UtsHb6uUYC+vyzQMHHxCUgoqagAlegBlJi5eJBBBYVEJKVkEJXV1Em1bTlUDTm09TltbSxsEfXVdEiMPXV1tUv1dQtVtf0D0LFwCYhJCAGMKMnEoakSpVJExSWSsuX0jIxJbVX1lCu11VUqjasR1DydbOW0lOXVjI22lXpAggdDhsYmpmbkkgSEFhllvJOEY8rptpx6vtVEpdKUTghcg1Ya4tjtDGCngEXv0QkNSIMIJNphhxGByOIAG6oADWFKJUTw4gwAFtGP1Zsl5uklqAsh0NvpbHUwcUlNsdtpETdNi0WgVDOUejjXviwiQiSTqMQiKhSPxsHhkAAzfWszWhJks1Dszk8OYA3mZRCCkjC0UHUyShHWV2qRxbMxGAqqIxyWxGdzPNVE4ZEMAmhOwAAW2rJFMmNPploI1rZHIwXP+aUWLoQchytnyVfDDncbgsfuysJIFSuN10B276hjeLjpATSbgae+uv1JENxrNRAtjOZBftfxSTrLwIraw26N29gORxl6n0JAhZm6Eu83n0feCA5IsAArqNRnBYHQmGxiyvS0D+fJ4Y5nB2Wwcl0EN9kRNpHG0K59iUcNQLcFU+hvd5SAfJ8X2iOIEgdblVx-GQ-y2Y9SluewTFuQ5EXWasfGaB4jE4UCw2xZC3gJEhRjwUYU0gN8WA4XCS0BPlCKRUo5RaQ9DAUUFjmbNoGjMNFGMMYCCmvdiNS4ni+JieJGE-Hk11-cTtEkrtXGgxR1kRLY8mMVRFDqbx3CMVxNPVYYTTwMhsHvBN+I-ISvxE8tnHM5pLJkmz5JqdzHDoloGKYhjWNxFCOJ8vyApofScOXYyCKyCKLOk6y5MRQxOHdM4FWuWE5DkXR-BxcR0DgKRY1Qx1v1ErJMGlZtMEceUxvGiFe1VftUPISgwF6sL1yUOF8iY4UikKEV3Ls2UnMUTh9AjKS5E829PmJKZFuddcfAqJxKwigp1kUVRETuI8oxUoM9GjabMo1LUrrwvry0jKruhIZS1muCpxTuM7ZqHZNRyga6TLEuQwwaD09C6FpNplSHdBg7ZLg0VQfERjj0OfWB4BBpbTPDTg5ChkUyncb09BlPR3TKC8HGg1ZVGp7TuN4iB0eKxBimrKKzhFJQyiqBTDEaFxALBKFDzF7zfP8hNpf62WWjKypEIKKrcih1wo06YpQWV1rfCAA */
    id: 'todo-loader',
    initial: 'idle',
    context: {
      slot: null
    },
    states: {
      idle: {
        on: {
          FETCH: {
            target: 'deciding',
            actions: 'setSlotFromEvent'
          },
          RESET: {
            actions: 'resetStore'
          }
        }
      },
      deciding: {
        always: [
          {
            target: 'refreshing',
            guard: 'hasCachedTodo',
            actions: 'setTodoFromCache'
          },
          {
            target: 'loading'
          }
        ]
      },
      loading: {
        invoke: {
          id: 'loadRandomTodo',
          src: 'loadRandomTodo',
          input: () => ({ delayMs: 0 }),
          onDone: {
            target: 'success',
            actions: 'saveResultToStore'
          },
          onError: {
            target: 'failure',
            actions: 'saveErrorToStore'
          }
        }
      },
      refreshing: {
        invoke: {
          id: 'loadRandomTodo',
          src: 'loadRandomTodo',
          input: () => ({ delayMs: CACHE_REFRESH_DELAY_MS }),
          onDone: {
            target: 'success',
            actions: 'saveResultToStore'
          },
          onError: {
            target: 'cached',
            actions: 'saveErrorToStore'
          }
        }
      },
      success: {
        on: {
          FETCH: {
            target: 'deciding',
            actions: 'setSlotFromEvent'
          },
          RESET: {
            target: 'idle',
            actions: 'resetStore'
          }
        }
      },
      cached: {
        on: {
          FETCH: {
            target: 'deciding',
            actions: 'setSlotFromEvent'
          },
          RESET: {
            target: 'idle',
            actions: 'resetStore'
          }
        }
      },
      failure: {
        on: {
          FETCH: {
            target: 'deciding',
            actions: 'setSlotFromEvent'
          },
          RESET: {
            target: 'idle',
            actions: 'resetStore'
          }
        }
      }
    }
  })
}
