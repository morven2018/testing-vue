export interface Income {
  income_id: string
  id: string
  incomeId: number
  number: string
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  totalPrice: number
  dateClose: string
  warehouseName: string
  nmId: number
  status: string
}

export interface Order {
  orderId: number
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  totalPrice: number
  discountPercent: number
  warehouse_name: string
  oblast: string
  incomeID: number
  odid: number
  nmId: number
  subject: string
  category: string
  brand: string
  isCancel: boolean
  cancel_dt: string
  gNumber: string
  sticker?: string
}

export interface Sale {
  saleId: number
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  totalPrice: number
  discountPercent: number
  isSupply: boolean
  isRealization: boolean
  orderId: number
  promoCodeDiscount?: number
  warehouse_name: string
  countryName: string
  oblastOkrugName: string
  regionName: string
  incomeID: number
  odid: number
  nmId: number
  subject: string
  category: string
  brand: string
  isStorno: boolean
  gNumber: string
  sticker?: string
}

export interface Stock {
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  isSupply: boolean
  isRealization: boolean
  quantity_full: number
  quantityNotInOrders: number
  warehouse: number
  warehouse_name: string
  inWayToClient: number
  inWayFromClient: number
  nmId: number
  subject: string
  category: string
  daysOnSite: number
  brand: string
  SCCode: string
  Price: number
  Discount: number
  total_price: number
}

export type ApiEndpoint = 'incomes' | 'orders' | 'sales' | 'stocks'
export type ApiData = Income | Order | Sale | Stock
