<template>
    <div class="data-table">
        <div v-if="loading" class="loading">Загрузка...</div>
        <div v-else-if="error" class="error">Ошибка: {{ error }}</div>
        <div v-else>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th 
                                v-for="column in columns" 
                                :key="column.key"
                                @click="handleSort(column.key)"
                                :class="{ sortable: column.sortable }"
                            >
                                {{ column.title }}
                                <span v-if="sortKey === column.key" class="sort-icon">
                                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in data" :key="getItemKey(item)">
                            <td v-for="column in columns" :key="column.key">
                                {{ formatValue(getItemProperty(item, column.key), column.type) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="showPagination && data.length > 0" class="pagination">
                <button 
                    @click="handlePrevPage" 
                    :disabled="currentPage === 1"
                    class="pagination-btn"
                >
                    Назад
                </button>
                
                <span class="pagination-info">
                    Страница {{ currentPage }} из {{ totalPages }}
                    <span v-if="showItemsInfo">(записи {{ from }} - {{ to }} из {{ totalItems }})</span>
                </span>
                
                <button 
                    @click="handleNextPage" 
                    :disabled="currentPage === totalPages"
                    class="pagination-btn"
                >
                    Вперед
                </button>
                
                <select 
                    :value="itemsPerPage" 
                    @change="handleItemsPerPageChange($event)" 
                    class="per-page-select"
                >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                
                <span class="items-per-page-label">на страницу</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Income, Order, Sale, Stock } from "@/types/api";

type ApiData = Income | Order | Sale | Stock;

export interface TableColumn {
    key: string;
    title: string;
    sortable?: boolean;
    type?: 'string' | 'number' | 'date' | 'currency';
}

interface Props {
    data: ApiData[];
    columns: TableColumn[];
    loading?: boolean;
    error?: string | null;
    showPagination?: boolean;
    itemsPerPage?: number;
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    from?: number;
    to?: number;
    showItemsInfo?: boolean;
    sortKey?: string;
    sortOrder?: 'asc' | 'desc';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
    loading: false,
    error: null,
    showPagination: true,
    itemsPerPage: 20,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    from: 0,
    to: 0,
    showItemsInfo: false,
    sortKey: '',
    sortOrder: 'asc'
});

const emit = defineEmits<{
    'update:itemsPerPage': [value: number]
    'prev-page': []
    'next-page': []
    'sort': [key: string]
}>();

const getItemKey = (item: ApiData): string => {
    if ('income_id' in item) return item.income_id;
    if ('id' in item) return JSON.stringify(item.id);
    if ('orderId' in item) return item.orderId.toString();
    if ('saleId' in item) return JSON.stringify(item.saleId);
    return Math.random().toString();
};

const getItemProperty = (item: ApiData, key: string): unknown => {
    return (item as unknown as Record<string, unknown>)[key];
};

const formatValue = (value: unknown, type?: string): string => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
        case 'number':
            return new Intl.NumberFormat('ru-RU').format(Number(value));
        case 'currency':
            return new Intl.NumberFormat('ru-RU', { 
                style: 'currency', 
                currency: 'RUB' 
            }).format(Number(value));
        case 'date':
            return new Date(value as string).toLocaleDateString('ru-RU');
        default:
            return String(value);
    }
};

const handleSort = (key: string) => {
    emit('sort', key);
};

const handlePrevPage = () => {
    emit('prev-page');
};

const handleNextPage = () => {
    emit('next-page');
};

const handleItemsPerPageChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    if (target) {
        emit('update:itemsPerPage', Number(target.value));
    }
};
</script>

<style scoped>
.data-table {
    width: 100%;
}

.table-container {
    overflow-x: auto;
    margin-bottom: 20px;
}

.table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.table th,
.table td {
    padding: 8px 12px;
    border: 1px solid #ddd;
    text-align: left;
}

.table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.table th.sortable {
    cursor: pointer;
    user-select: none;
}

.table th.sortable:hover {
    background-color: #e9ecef;
}

.sort-icon {
    margin-left: 5px;
}

.pagination {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.pagination-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
    background: #f5f5f5;
}

.per-page-select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.items-per-page-label {
    color: #666;
    font-size: 14px;
}

.pagination-info {
    font-size: 14px;
    color: #666;
}

.loading, .error {
    text-align: center;
    padding: 40px;
    font-size: 16px;
}

.error {
    color: #dc3545;
}
</style>