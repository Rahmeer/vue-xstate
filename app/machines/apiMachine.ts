import { assign, fromPromise, setup } from 'xstate'

const API_BASE_URL = 'https://dummyjson.com/users'

interface ApiStoreContract {
  setUser: (payload: unknown, userId: number) => void
  setCurrentUserFromCache: (userId: number) => boolean
  hasUserById: (userId: number) => boolean
  setError: (message: string) => void
  clear: () => void
}

interface DummyUserResponse {
  id: number
  [key: string]: unknown
}

export function createUserMachine(store: ApiStoreContract) {
  return setup({
    types: {
      context: {} as { userId: number | null }
    },
    actors: {
      loadUser: fromPromise<DummyUserResponse, { userId: number }>(async ({ input }) => {
        return await $fetch(`${API_BASE_URL}/${input.userId}`)
      })
    },
    actions: {
      saveResultToStore: ({ event }) => {
        if (event.type === 'xstate.done.actor.loadUser') {
          store.setUser(event.output, event.output.id)
        }
      },
      saveErrorToStore: ({ event }) => {
        if (event.type === 'xstate.error.actor.loadUser') {
          const message = event.error instanceof Error ? event.error.message : 'Request failed'
          store.setError(message)
        }
      },
      setUserIdFromEvent: assign({
        userId: ({ event }) =>
          (event.type === 'FETCH' || event.type === 'FORCE_FETCH') ? event.userId : null
      }),
      setUserFromCache: ({ context }) => {
        if (context.userId !== null) {
          store.setCurrentUserFromCache(context.userId)
        }
      },
      resetStore: () => {
        store.clear()
      }
    },
    guards: {
      hasCachedUser: ({ context }) => context.userId !== null && store.hasUserById(context.userId)
    }
  }).createMachine({
    id: 'user-loader',
    initial: 'idle',
    context: {
      userId: null
    },
    states: {
      idle: {
        on: {
          FETCH: {
            target: 'deciding',
            actions: 'setUserIdFromEvent'
          },
          FORCE_FETCH: {
            target: 'loading',
            actions: 'setUserIdFromEvent'
          },
          RESET: {
            actions: 'resetStore'
          }
        }
      },
      deciding: {
        always: [
          {
            target: 'cached',
            guard: 'hasCachedUser',
            actions: 'setUserFromCache'
          },
          {
            target: 'loading'
          }
        ]
      },
      loading: {
        invoke: {
          id: 'loadUser',
          src: 'loadUser',
          input: ({ context }) => ({ userId: context.userId ?? 1 }),
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
      success: {
        on: {
          FETCH: {
            target: 'deciding',
            actions: 'setUserIdFromEvent'
          },
          FORCE_FETCH: {
            target: 'loading',
            actions: 'setUserIdFromEvent'
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
            actions: 'setUserIdFromEvent'
          },
          FORCE_FETCH: {
            target: 'loading',
            actions: 'setUserIdFromEvent'
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
            actions: 'setUserIdFromEvent'
          },
          FORCE_FETCH: {
            target: 'loading',
            actions: 'setUserIdFromEvent'
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
