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
    /** @xstate-layout N4IgpgJg5mDOIC5QFdZgE4FoA2B7AhhBgHQCWE2YAxAGICiAKgMIASA2gAwC6ioADrlikALqVwA7XiAAeiACwBODsQ4A2AEwBWdatUB2dWr0KANCACeiPQGZrxABx7NHNQsf2FTgL5ezqDDgEROhkFNQ0APIASkx0APr0zOzcUgJCohJSsgiKympaOvqG+qYWiOpaxBrOHIb2tdaePn5oWHiEJOSUVFF0AMqMnDxIIGkiYpIj2daaCsQAjFoc8xxONvaqZpYIqpr2Ki7LctZqHPWqzSD+bUEkRADG5KTiUFRDqYLjmVOI9fPEck01nmTnmzlmiy2iGsBgOLkWemOBk0F18V1agQ6IQeTxeb3mw34nwyk1A2XmFLyclUCnUbiUBgUmzKCD0Gjhy3UcnmJxheku10xwWI7Qgz1eEAkYDI4gAbrgANbS0UAVVa7xGYxJWUQFJWKmptPpqzpzO282peg56nOHDkeg2AoxopIovFVAw6FwIT42HwwgAZt6ALYioJqjAaonpCY6hB61RVJaaY6qWyrexQ+McaxyJPOMH2XNpvT8tGCl0hWDIe73OCwWiMVhR0bE2M-eM2YgKHs91S1GnzexyORZlYVBZLME84d7eZOgKV4jV2v12jRWIJJvJQmtmPfMm6ru9vsDhRDkdj6zqf4w5zqa8eZb2ewLm5Y5c1uuwBu9AYMFstXbQ9OzsE8mTPC9RxZGxEzvFwaXcTxNDfIUSHufB7gAC0gRskkAtsDxkI8wJPfsdHPYdoO2TQeQcJxlgaM4XGsVClww7DcMiGJ4kSZsUk1QjSWI0DuzIyCqKzex-kUXt6jtBRZjkV9y2dW4Qg4nCIB6fpBgE6MvmE8lj3EiioKzNM5kWWSXxhWxVBUlpF3U4gA3wUhsGQdBwm3Aj9yMqxPAWRwgUROlAWo34HQ5Sk0xBB02JctyPK88IN143z9L3Qy42MK0hycGE5HClMx3i4glmWWkeXWVEnPfYVks87ydP-Pyco7FM80qrRlIdIEzV1eZdGIeCZh7Itjh8NFxFwIh4BGCt1I+fy40wQaEEwTQxPA3brDq9FnI-LowBWjqQJhf4OAUPlVk5fQ9CzNllB6rkUVUblWNUo7hRxMUXjO7UOx7K1gS0bQwR7G8NueiqahcG0zkUg6lo-N0AcE1aOx5M5uyoi0qrBMccyuw5hpcEdrxRtSPxXb8FoMoGQOKsd7Tma8C25RxaXsdREo-TTIEB4CRJZlldmUEcJve67dkcw6GpIJrUuFojsn0baCpTAmtBmTQyqUOGXFg4qiy5aavCAA */
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
