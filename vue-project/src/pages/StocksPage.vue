
<template>
  <div class="stocks-page">
    <h1>Остатки товаров</h1>
    
    <SimpleChart 
      :data="chartData" 
      title="Полные остатки по складам"
      value-key="quantity_full"
      label-key="warehouse"
      chart-type="bar"
    />
    
    <div class="filters">
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
        <span class="stat-value">{{ totalQuantity.toLocaleString('ru-RU') }} шт.</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Полное количество:</span>
        <span class="stat-value">{{ totalQuantityFull.toLocaleString('ru-RU') }} шт.</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Общая стоимость:</span>
        <span class="stat-value">{{ totalPrice.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}</span>
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
import type { Stock } from "@/types/api";


const { data, loading, error, fetchData, updateFilters, clearFilters, pagination, goToPage, changePerPage } = useApiData<Stock>();

const localFilters = ref({
  supplier_article: '',
  warehouse_name: ''
});

const sortKey = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

const itemsPerPage = ref(20);

const chartData = computed(() => {
  if (!data.value || data.value.length === 0) return [];

  const dataByWarehouse = new Map<string, number>();
  
  data.value.forEach(item => {
    try {
      const warehouse = item.warehouse_name || 'Не указан';
      const quantityFull = item.quantity_full || 0;
      dataByWarehouse.set(warehouse, (dataByWarehouse.get(warehouse) || 0) + quantityFull);
    } catch (error) {
      console.error('Ошибка обработки данных остатков:', error, item);
    }
  });

  const result: Array<{warehouse: string; quantity_full: number}> = [];
  
  dataByWarehouse.forEach((quantityFull, warehouse) => {
    result.push({
      warehouse,
      quantity_full: quantityFull
    });
  });

  return result.sort((a, b) => b.quantity_full - a.quantity_full);
});

const totalQuantity = computed(() => {
  return data.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
});

const totalQuantityFull = computed(() => {
  return data.value.reduce((sum, item) => sum + (Number(item.quantity_full) || 0), 0);
});

const totalPrice = computed(() => {
  return data.value.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
});

const columns: TableColumn[] = [
  { key: 'last_change_date', title: 'Дата изменения', sortable: true, type: 'date' },
  { key: 'supplier_article', title: 'Артикул поставщика', sortable: true, type: 'string' },
  { key: 'tech_size', title: 'Размер', sortable: true, type: 'string' },
  { key: 'barcode', title: 'Штрихкод', sortable: true, type: 'string' },
  { key: 'is_supply', title: 'В поставке', sortable: true, type: 'string' },
  { key: 'is_realization', title: 'В реализации', sortable: true, type: 'string' },
  { key: 'quantity_full', title: 'Полное количество', sortable: true, type: 'number' },
  { key: 'warehouse_name', title: 'Склад', sortable: true, type: 'string' },
  { key: 'nm_id', title: 'Артикул WB', sortable: true, type: 'number' },
  { key: 'subject', title: 'Предмет', sortable: true, type: 'string' },
  { key: 'category', title: 'Категория', sortable: true, type: 'string' },
  { key: 'days_on_site', title: 'Дней на сайте', sortable: true, type: 'number' },
  { key: 'brand', title: 'Бренд', sortable: true, type: 'string' },
  { key: 'price', title: 'Цена', sortable: true, type: 'currency' },
  { key: 'discount', title: 'Скидка', sortable: true, type: 'currency' }
];

const sortedData = computed(() => {
  if (!sortKey.value) return data.value;

  return [...data.value].sort((a, b) => {
    let aValue = a[sortKey.value as keyof Stock];
    let bValue = b[sortKey.value as keyof Stock];

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
  
  updateFilters(activeFilters);
  fetchData('stocks');
};

const clearAllFilters = (): void => {
  localFilters.value = {
    supplier_article: '',
    warehouse_name: ''
  };
  clearFilters();
  fetchData('stocks');
};

const refreshData = (): void => {
  fetchData('stocks');
};

const onItemsPerPageChange = (newPerPage: number): void => {
  itemsPerPage.value = newPerPage;
  changePerPage(newPerPage);
  fetchData('stocks');
};

const onPageChange = (page: number): void => {
  goToPage(page);
  fetchData('stocks');
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
  fetchData('stocks');
});
</script>

<style scoped>
.stocks-page {
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