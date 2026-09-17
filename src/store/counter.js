import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Pinia 示例 store：计数器
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function reset() {
    count.value = 0
  }

  return { count, double, increment, reset }
})
