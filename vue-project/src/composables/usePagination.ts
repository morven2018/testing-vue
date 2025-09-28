import { computed, ref, type Ref } from "vue";

interface UsePaginationReturn {
  currentPage: Ref<number>
  perPage: Ref<number>
  totalPages: Ref<number>
  paginatedItems: <T>(items: Ref<T[]>) => Ref<T[]>
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
}

export function usePagination(itemsPerPage: number = 20): UsePaginationReturn {
  const currentPage = ref<number>(1)
  const perPage = ref<number>(itemsPerPage)

  const totalPages = computed<number>(() => {
    return 0 
  })

  const paginatedItems = <T>(items: Ref<T[]>): Ref<T[]> => {
    return computed<T[]>(() => {
      const start = (currentPage.value - 1) * perPage.value
      const end = start + perPage.value
      return items.value.slice(start, end)
    })
  }

  const nextPage = (): void => {
    currentPage.value += 1
  }

  const prevPage = (): void => {
    if (currentPage.value > 1) {
      currentPage.value -= 1
    }
  }

  const goToPage = (page: number): void => {
    if (page >= 1) {
      currentPage.value = page
    }
  }

  return {
    currentPage,
    perPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
  }
}
