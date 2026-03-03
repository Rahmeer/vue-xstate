<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMachine } from '@xstate/vue'
import { createUserMachine } from '~/machines/apiMachine'
import { useApiDataStore } from '~/stores/apiData'

const route = useRoute()
const store = useApiDataStore()
const { user, currentUserId, error, lastFetchedAt, requestCount } = storeToRefs(store)

const machine = createUserMachine(store)
const { snapshot, send } = useMachine(machine)

const machineState = computed(() => snapshot.value.value)
const isLoading = computed(() => snapshot.value.matches('loading'))
const isCached = computed(() => snapshot.value.matches('cached'))
const userId = computed(() => Number(route.params.id))
const isValidUserId = computed(() => Number.isInteger(userId.value) && userId.value > 0)
const previousUserId = computed(() => Math.max(1, userId.value - 1))
const nextUserId = computed(() => (userId.value > 0 ? userId.value + 1 : 2))

const prettyUser = computed(() => {
  return user.value ? JSON.stringify(user.value, null, 2) : ''
})

function fetchCurrentUser() {
  if (!isValidUserId.value) {
    send({ type: 'RESET' })
    store.setError('Invalid user id in URL. Use /user/1, /user/2, ...')
    return
  }

  send({ type: 'FETCH', userId: userId.value })
}

onMounted(() => {
  fetchCurrentUser()
})

watch(() => route.params.id, () => {
  fetchCurrentUser()
})
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold">
            User {{ route.params.id }}
          </h1>
          <p class="text-sm text-muted">
            URL-driven fetching with XState transitions and Pinia persistence.
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
            v-if="isCached"
            color="success"
            variant="subtle"
          >
            source: pinia-cache
          </UBadge>
          <UBadge
            color="neutral"
            variant="subtle"
          >
            pinia currentUserId: {{ currentUserId ?? '-' }}
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
            :loading="isLoading"
            @click="fetchCurrentUser"
          >
            Load user/{{ route.params.id }}
          </UButton>
          <UButton
            color="primary"
            variant="outline"
            :loading="isLoading"
            @click="send({ type: 'FORCE_FETCH', userId })"
          >
            Force API fetch
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            :to="`/user/${previousUserId}`"
            :disabled="userId <= 1"
          >
            Previous user
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            :to="`/user/${nextUserId}`"
          >
            Next user
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
          v-else-if="user"
          class="space-y-2"
        >
          <p class="text-sm text-muted">
            User loaded from https://dummyjson.com/users/{{ route.params.id }} and stored in Pinia.
          </p>
          <pre class="text-xs overflow-auto rounded-md p-4 bg-elevated">{{ prettyUser }}</pre>
        </div>

        <p
          v-else
          class="text-sm text-muted"
        >
          No user loaded yet.
        </p>
      </div>
    </UCard>
  </UContainer>
</template>
