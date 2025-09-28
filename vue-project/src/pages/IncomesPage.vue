<script setup lang="ts">
import DataTable, { type TableColumn } from "@/components/DataTable.vue";
import SimpleChart from "@/components/SimpleChart.vue";
import { computed, onMounted, ref } from "vue";
import { useApiData } from "@/composables/useApiData";
import type { Income } from "@/types/api";

const { data, loading, error, fetchData, updateFilters, clearFilters, pagination, goToPage, changePerPage } = useApiData<Income>();

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

const columns: TableColumn[] = [
  { key: 'income_id', title: 'ID поступления', sortable: true, type: 'number' },
  { key: 'number', title: 'Номер поставки', sortable: true, type: 'string' },
  { key: 'date', title: 'Дата поступления', sortable: true, type: 'date' },
  { key: 'last_change_date', title: 'Дата изменения', sortable: true, type: 'date' },
  { key: 'supplier_article', title: 'Артикул поставщика', sortable: true, type: 'string' },
  { key: 'tech_size', title: 'Размер', sortable: true, type: 'string' },
  { key: 'barcode', title: 'Штрихкод', sortable: true, type: 'string' },
  { key: 'quantity', title: 'Количество', sortable: true, type: 'number' },
  { key: 'total_price', title: 'Общая стоимость', sortable: true, type: 'currency' },
  { key: 'date_close', title: 'Дата закрытия', sortable: true, type: 'date' },
  { key: 'warehouse_name', title: 'Склад', sortable: true, type: 'string' },
  { key: 'nm_id', title: 'Артикул WB', sortable: true, type: 'number' }
];

const sortedData = computed(() => {
  if (!sortKey.value) return data.value;

  return [...data.value].sort((a, b) => {
    let aValue = a[sortKey.value as keyof Income];
    let bValue = b[sortKey.value as keyof Income];

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
  fetchData('incomes');
};

const clearAllFilters = (): void => {
  localFilters.value = {
    supplier_article: '',
    warehouse_name: '',
    dateFrom: getDefaultDateFrom(),
    dateTo: getCurrentDateTo()
  };
  clearFilters();
  fetchData('incomes');
};

const refreshData = (): void => {
  fetchData('incomes');
};

const onItemsPerPageChange = (newPerPage: number): void => {
  itemsPerPage.value = newPerPage;
  changePerPage(newPerPage);
  fetchData('incomes');
};

const onPageChange = (page: number): void => {
  goToPage(page);
  fetchData('incomes');
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
  fetchData('incomes');
});
</script>

<template>
  <div class="incomes-page">
    <h1>Поступления товаров</h1>
    
    <SimpleChart 
      :data="data" 
      title="Количество поступлений по дням"
    />
    
    <div class="filters">
      <div class="filter-group">
        <label>Дата от:
        <input 
          type="date"
          v-model="localFilters.dateFrom" 
          @change="applyFilters"
          class="filter-input"
        ></label>
      </div>
      
      <div class="filter-group">
        <label>Дата до:
        <input 
          type="date"
          v-model="localFilters.dateTo" 
          @change="applyFilters"
          class="filter-input"
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
        <span class="stat-label">Общее количество:</span>
        <span class="stat-value">{{ data.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('ru-RU') }} шт.</span>
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

<style scoped>
.incomes-page {
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