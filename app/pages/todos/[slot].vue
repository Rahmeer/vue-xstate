<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMachine } from '@xstate/vue'
import { createTodoMachine } from '~/machines/todoMachine'
import { useTodoDataStore } from '~/stores/todoData'
import type { TodoSlot } from '~/stores/todoData'

const route = useRoute()
const store = useTodoDataStore()
const { todo, currentSlot, error, lastFetchedAtBySlot, requestCount } = storeToRefs(store)

const machine = createTodoMachine(store)
const { snapshot, send } = useMachine(machine)

const machineState = computed(() => snapshot.value.value)
const isLoading = computed(() => snapshot.value.matches('loading'))
const isRefreshing = computed(() => snapshot.value.matches('refreshing'))
const slotParam = computed(() => Number(route.params.slot))
const isValidSlot = computed(() => slotParam.value === 1 || slotParam.value === 2)
const slot = computed<TodoSlot | null>(() => (isValidSlot.value ? slotParam.value as TodoSlot : null))

const prettyTodo = computed(() => {
  return todo.value ? JSON.stringify(todo.value, null, 2) : ''
})

const lastFetchedAt = computed(() => {
  if (slot.value === null) {
    return null
  }

  return lastFetchedAtBySlot.value[slot.value] ?? null
})

function fetchCurrentSlotTodo() {
  if (slot.value === null) {
    send({ type: 'RESET' })
    store.setError('Invalid todo slot in URL. Use /todos/1 or /todos/2')
    return
  }

  send({ type: 'FETCH', slot: slot.value })
}

onMounted(() => {
  fetchCurrentSlotTodo()
})

watch(() => route.params.slot, () => {
  fetchCurrentSlotTodo()
})
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold">
            Todos slot {{ route.params.slot }}
          </h1>
          <p class="text-sm text-muted">
            URL uses /todos/1 or /todos/2 while API fetches https://dummyjson.com/todos/random.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            color="neutral"
            variant="subtle"
          >
            machine: {{ machineState }}
          </UBadge>
          <UBadge
            v-if="isRefreshing"
            color="warning"
            variant="subtle"
          >
            source: cache + background refresh (5s delay)
          </UBadge>
          <UBadge
            color="neutral"
            variant="subtle"
          >
            pinia currentSlot: {{ currentSlot ?? '-' }}
          </UBadge>
          <UBadge
            color="neutral"
            variant="subtle"
          >
            requests: {{ requestCount }}
          </UBadge>
          <UBadge
            v-if="lastFetchedAt"
            color="neutral"
            variant="subtle"
          >
            last fetch: {{ new Date(lastFetchedAt).toLocaleString() }}
          </UBadge>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            :loading="isLoading || isRefreshing"
            @click="fetchCurrentSlotTodo"
          >
            Load todos/random to slot {{ route.params.slot }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            to="/todos/1"
          >
            todos/1
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            to="/todos/2"
          >
            todos/2
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="send({ type: 'RESET' })"
          >
            Reset
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            to="/"
          >
            Back to home
          </UButton>
        </div>

        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          title="Request failed"
          :description="error"
        />

        <div
          v-else-if="todo"
          class="space-y-2"
        >
          <p class="text-sm text-muted">
            Showing slot {{ currentSlot }}. Cached first when available, then refreshed from
            https://dummyjson.com/todos/random after a 5-second delay.
          </p>
          <pre class="text-xs overflow-auto rounded-md p-4 bg-elevated">{{ prettyTodo }}</pre>
        </div>

        <p
          v-else
          class="text-sm text-muted"
        >
          No todo loaded yet.
        </p>
      </div>
    </UCard>
  </UContainer>
</template>
