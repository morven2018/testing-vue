<template>
  <div class="sales-page">
    <h1>Продажи</h1>
    
    <SimpleChart 
      :data="chartData" 
      title="Количество продаж по складам"
      value-key="count"
      label-key="warehouse"
      chart-type="bar"
    />
    
    <div class="filters">
      <div class="filter-group">
        <label>Дата от:
        <input 
          type="date"
          v-model="localFilters.dateFrom" 
          @change="applyFilters"
          class="filter-input"
          :max="localFilters.dateTo"
        ></label>
      </div>
      
      <div class="filter-group">
        <label>Дата до:
        <input 
          type="date"
          v-model="localFilters.dateTo" 
          @change="applyFilters"
          class="filter-input"
          :min="localFilters.dateFrom"
        ></label>
      </div>
      
      <div class="filter-group">
        <label>Артикул поставщика:
        <input 
          v-model="localFilters.supplier_article" 
          @input="applyFilters"
          placeholder="Введите артикул"
          class="filter-input"
        ></label>
      </div>
      
      <div class="filter-group">
        <label>Склад:
        <input 
          v-model="localFilters.warehouse_name" 
          @input="applyFilters"
          placeholder="Введите склад"
          class="filter-input"
        ></label>
      </div>
      
      <button @click="clearAllFilters" class="clear-btn">Очистить фильтры</button>
      <button @click="refreshData" class="refresh-btn" :disabled="loading">
        {{ loading ? 'Загрузка...' : 'Обновить' }}
      </button>
    </div>

    <div class="stats" v-if="!loading && !error && data.length > 0">
      <div class="stat-item">
        <span class="stat-label">Всего записей в базе:</span>
        <span class="stat-value">{{ pagination.totalItems.toLocaleString('ru-RU') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Показано записей:</span>
        <span class="stat-value">{{ sortedData.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Всего продаж:</span>
        <span class="stat-value">{{ data.length.toLocaleString('ru-RU') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Уникальных складов:</span>
        <span class="stat-value">{{ new Set(data.map(item => item.warehouse_name)).size }}</span>
      </div>
    </div>

    <DataTable
      :data="sortedData"
      :columns="columns"
      :loading="loading"
      :error="error"
      :show-pagination="true"
      :items-per-page="itemsPerPage"
      :current-page="pagination.currentPage"
      :total-pages="pagination.totalPages"
      :total-items="pagination.totalItems"
      :from="pagination.from"
      :to="pagination.to"
      :show-items-info="true"
      :sort-key="sortKey"
      :sort-order="sortOrder"
      @update:itemsPerPage="onItemsPerPageChange"
      @prev-page="onPrevPage"
      @next-page="onNextPage"
      @sort="onSort"
    />
  </div>
</template>

<script setup lang="ts">
import DataTable, { type TableColumn } from "@/components/DataTable.vue";
import SimpleChart from "@/components/SimpleChart.vue";
import { computed, onMounted, ref } from "vue";
import { useApiData } from "@/composables/useApiData";
import type { Sale } from "@/types/api";

const { data, loading, error, fetchData, updateFilters, clearFilters, pagination, goToPage, changePerPage } = useApiData<Sale>();

const localFilters = ref({
  supplier_article: '',
  warehouse_name: '',
  dateFrom: getDefaultDateFrom(),
  dateTo: getCurrentDateTo()
});

const sortKey = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

const itemsPerPage = ref(20);

function getDefaultDateFrom(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7); 
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentDateTo(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const chartData = computed(() => {
  if (!data.value || data.value.length === 0) {
    console.log('No data available for chart');
    return [];
  }

  console.log('Raw sales data:', data.value);
  
  const dataByWarehouse = new Map<string, number>();
  
  data.value.forEach((item, index) => {
    try {
      const warehouse = item.warehouse_name || 'Не указан';
      
      dataByWarehouse.set(warehouse, (dataByWarehouse.get(warehouse) || 0) + 1);
      
    } catch (error) {
      console.error(`Error processing item ${index}:`, error, item);
    }
  });

  console.log('Data by warehouse:', Array.from(dataByWarehouse.entries()));

  const result: Array<{warehouse: string; count: number}> = [];
  
  dataByWarehouse.forEach((count, warehouse) => {
    result.push({
      warehouse,
      count
    });
  });

  console.log('Final chart data:', result);
  
  return result.sort((a, b) => b.count - a.count);
});

const columns: TableColumn[] = [
  { key: 'date', title: 'Дата продажи', sortable: true, type: 'date' },
  { key: 'last_change_date', title: 'Дата изменения', sortable: true, type: 'date' },
  { key: 'supplier_article', title: 'Артикул поставщика', sortable: true, type: 'string' },
  { key: 'tech_size', title: 'Размер', sortable: true, type: 'string' },
  { key: 'barcode', title: 'Штрихкод', sortable: true, type: 'string' },
  { key: 'warehouse_name', title: 'Склад', sortable: true, type: 'string' },
  { key: 'country_name', title: 'Страна', sortable: true, type: 'string' },
  { key: 'oblast_okrug_name', title: 'Округ', sortable: true, type: 'string' },
  { key: 'region_name', title: 'Регион', sortable: true, type: 'string' },
  { key: 'income_id', title: 'ID поставки', sortable: true, type: 'number' },
  { key: 'sale_id', title: 'ID продажи', sortable: true, type: 'string' },
  { key: 'nm_id', title: 'Артикул WB', sortable: true, type: 'number' },
  { key: 'subject', title: 'Предмет', sortable: true, type: 'string' },
  { key: 'category', title: 'Категория', sortable: true, type: 'string' },
  { key: 'brand', title: 'Бренд', sortable: true, type: 'string' }
];

const sortedData = computed(() => {
  if (!sortKey.value) return data.value;

  return [...data.value].sort((a, b) => {
    let aValue = a[sortKey.value as keyof Sale];
    let bValue = b[sortKey.value as keyof Sale];

    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    const aString = String(aValue);
    const bString = String(bValue);

    const aNum = parseFloat(aString);
    const bNum = parseFloat(bString);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortOrder.value === 'asc' ? aNum - bNum : bNum - aNum;
    }

    if (sortOrder.value === 'asc') {
      return aString.localeCompare(bString);
    } else {
      return bString.localeCompare(aString);
    }
  });
});

const applyFilters = (): void => {
  if (localFilters.value.dateFrom && localFilters.value.dateTo) {
    const fromDate = new Date(localFilters.value.dateFrom);
    const toDate = new Date(localFilters.value.dateTo);
    
    if (fromDate > toDate) {
      alert('Дата "от" не может быть больше даты "до"');
      return;
    }
  }

  const activeFilters: Record<string, string> = {};
  
  if (localFilters.value.supplier_article) {
    activeFilters.supplier_article = localFilters.value.supplier_article;
  }
  
  if (localFilters.value.warehouse_name) {
    activeFilters.warehouse_name = localFilters.value.warehouse_name;
  }

  if (localFilters.value.dateFrom) {
    activeFilters.dateFrom = localFilters.value.dateFrom;
  }
  
  if (localFilters.value.dateTo) {
    activeFilters.dateTo = localFilters.value.dateTo;
  }
  
  updateFilters(activeFilters);
  fetchData('sales');
};

const clearAllFilters = (): void => {
  localFilters.value = {
    supplier_article: '',
    warehouse_name: '',
    dateFrom: getDefaultDateFrom(),
    dateTo: getCurrentDateTo()
  };
  clearFilters();
  fetchData('sales');
};

const refreshData = (): void => {
  fetchData('sales');
};

const onItemsPerPageChange = (newPerPage: number): void => {
  itemsPerPage.value = newPerPage;
  changePerPage(newPerPage);
  fetchData('sales');
};

const onPageChange = (page: number): void => {
  goToPage(page);
  fetchData('sales');
};

const onPrevPage = (): void => {
  if (pagination.value.currentPage > 1) {
    onPageChange(pagination.value.currentPage - 1);
  }
};

const onNextPage = (): void => {
  if (pagination.value.currentPage < pagination.value.totalPages) {
    onPageChange(pagination.value.currentPage + 1);
  }
};

const onSort = (key: string): void => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

onMounted(() => {
  updateFilters({
    dateFrom: localFilters.value.dateFrom,
    dateTo: localFilters.value.dateTo
  });
  fetchData('sales');
});
</script>

<style scoped>
.sales-page {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.clear-btn, .refresh-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  height: fit-content;
}

.clear-btn:hover, .refresh-btn:hover {
  background: #f5f5f5;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}
</style>