import type { Income, Order, Sale, Stock } from "@/types/api";

const API_BASE_URL = 'http://109.73.206.144:6969/api';
const API_KEY = import.meta.env.VITE_WB_API_KEY || "";

interface ApiParams {
  dateFrom: string
  [key: string]: string | number | boolean | undefined
}

interface ApiResponse<T> {
  data: T[]
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta?: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: string
    to: number
    total: number
  }
}

class Api {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = API_BASE_URL
  }

  private async request<T>(endpoint: string, params: ApiParams): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    const defaultParams: ApiParams = {
      dateFrom: params.dateFrom, 
      key: this.apiKey,
      limit: 100,
      page: 1,
      dateTo: ""
    }

    const allParams: ApiParams = { ...defaultParams, ...params }

    Object.keys(allParams).forEach((key) => {
      const value = allParams[key]
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value.toString())
      }
    })

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return (await response.json()) as ApiResponse<T>
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  private getYesterdayDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getIncomes(dateFrom: string, dateTo: string, params: Omit<ApiParams, 'dateFrom'> = {}): Promise<ApiResponse<Income>> {
    return this.request<Income>('/incomes', { dateFrom, dateTo, ...params })
  }

  async getOrders(dateFrom: string, dateTo: string, params: Omit<ApiParams, 'dateFrom'> = {}): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders', { dateFrom, dateTo, ...params })
  }

  async getSales(dateFrom: string, dateTo: string, params: Omit<ApiParams, 'dateFrom'> = {}): Promise<ApiResponse<Sale>> {
    return this.request<Sale>('/sales', { dateFrom, dateTo, ...params })
  }

  async getStocks(params: Omit<ApiParams, 'dateFrom'> = {}): Promise<ApiResponse<Stock>> {
    const yesterday = this.getYesterdayDate();
    return this.request<Stock>('/stocks', { dateFrom: yesterday, ...params })
  }
}

export const wbApi = new Api(API_KEY)
