import { computed, ref, type Ref } from "vue";
import { wbApi } from "@/api/api";
import type { ApiData, ApiEndpoint } from "@/types/api";

interface Filters {
  [key: string]: string | number | boolean | undefined
}

interface PaginationInfo {
  currentPage: number
  perPage: number
  totalPages: number
  totalItems: number
  from: number
  to: number
}

interface UseApiDataReturn<T> {
  data: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  pagination: Ref<PaginationInfo>
  fetchData: (endpoint: ApiEndpoint, customFilters?: Filters) => Promise<void>
  updateFilters: (newFilters: Filters) => void
  clearFilters: () => void
  goToPage: (page: number) => void
  changePerPage: (perPage: number) => void
  filters: Ref<Filters>
}

export function useApiData<T extends ApiData>(): UseApiDataReturn<T> {
  const data = ref<T[]>([]) as Ref<T[]>
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const filters = ref<Filters>({})

  const pagination = ref<PaginationInfo>({
    currentPage: 1,
    perPage: 20,
    totalPages: 1,
    totalItems: 0,
    from: 0,
    to: 0
  })

  const getDefaultDateFrom = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 7); 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const getCurrentDateTo = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const fetchData = async (endpoint: ApiEndpoint, customFilters: Filters = {}): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const dateFrom = (filters.value.dateFrom as string) || getDefaultDateFrom();
      const dateTo = (filters.value.dateTo as string) || getCurrentDateTo();
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dateFrom: _, dateTo: __, ...otherFilters } = { ...filters.value, ...customFilters };
      
      const apiFilters = {
        ...otherFilters,
        page: pagination.value.currentPage,
        limit: pagination.value.perPage 
      };


      let result
      switch (endpoint) {
        case 'incomes':
          result = await wbApi.getIncomes(dateFrom, dateTo, apiFilters)
          break
        case 'orders':
          result = await wbApi.getOrders(dateFrom, dateTo, apiFilters)
          break
        case 'sales':
          result = await wbApi.getSales(dateFrom, dateTo, apiFilters)
          break
        case 'stocks':
          result = await wbApi.getStocks(dateFrom, dateTo, apiFilters)
          break
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`)
      }

      data.value = result.data as T[] || []

      if (result.meta) {
        pagination.value = {
          currentPage: result.meta.current_page || pagination.value.currentPage,
          perPage: parseInt(result.meta.per_page) || pagination.value.perPage,
          totalPages: result.meta.last_page || pagination.value.totalPages,
          totalItems: result.meta.total || pagination.value.totalItems,
          from: result.meta.from || pagination.value.from,
          to: result.meta.to || pagination.value.to
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters: Filters): void => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.currentPage = 1
  }

  const clearFilters = (): void => {
    filters.value = {}
    pagination.value.currentPage = 1
  }

  const goToPage = (page: number): void => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      pagination.value.currentPage = page
    }
  }

  const changePerPage = (perPage: number): void => {
    pagination.value.perPage = perPage
    pagination.value.currentPage = 1 
  }

  const filteredData = computed<T[]>(() => {
    if (!filters.value || Object.keys(filters.value).length === 0) {
      return data.value
    }

    return data.value.filter((item: T) => {
      return Object.entries(filters.value).every(([key, value]) => {
        if (!value || value === '') return true
        
        if (key === 'dateFrom' || key === 'dateTo') return true

        const itemValue = (item as unknown as Record<string, unknown>)[key]
        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase())
        }

        return itemValue === value
      })
    })
  })

  return {
    data: filteredData,
    loading,
    error,
    pagination,
    fetchData,
    updateFilters,
    clearFilters,
    goToPage,
    changePerPage,
    filters,
  }
}