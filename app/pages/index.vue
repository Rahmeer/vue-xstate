<script setup lang="ts">
const quickUserLinks = [1, 2, 3, 4, 5]
const quickTodoSlots = [1, 2]
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold">
            Pinia + XState User Loader
          </h1>
          <p class="text-sm text-muted">
            Open a user route like /user/1 or /user/2 to fetch from DummyJSON.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-muted">
          Quick links:
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="userId in quickUserLinks"
            :key="userId"
            color="neutral"
            variant="outline"
            :to="`/user/${userId}`"
          >
            user/{{ userId }}
          </UButton>
        </div>

        <p class="text-sm text-muted">
          Todos slots (cached per slot, fetched from /todos/random):
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="slot in quickTodoSlots"
            :key="slot"
            color="neutral"
            variant="outline"
            :to="`/todos/${slot}`"
          >
            todos/{{ slot }}
          </UButton>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
