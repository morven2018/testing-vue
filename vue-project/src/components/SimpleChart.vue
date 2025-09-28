<template>
  <div class="simple-chart">
    <h3>{{ title }}</h3>
    <div v-if="!data || data.length === 0" class="no-data">
      Нет данных для графика
    </div>
    <div v-else class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { Chart, registerables, type ChartItem } from 'chart.js';

Chart.register(...registerables);

interface ChartDataItem {
  [key: string]: unknown;
}

interface Props {
  data: ChartDataItem[];
  title: string;
  valueKey?: string;
  labelKey?: string;
  groupBy?: string;
  chartType?: 'bar' | 'line';
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: 'quantity',
  labelKey: 'date',
  groupBy: '',
  chartType: 'bar'
});

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: Chart | null = null;

const createChart = () => {
  if (!chartCanvas.value || !props.data || props.data.length === 0) {
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  if (props.groupBy) {
    createGroupedChart();
  } else {
    createSimpleChart();
  }
};

const createGroupedChart = () => {
  const groupedData = new Map<string, Map<string, number>>();
  const groups = new Set<string>();

  props.data.forEach(item => {
    try {
      const label = String(item[props.labelKey] || '');
      const group = String(item[props.groupBy] || 'Не указано');
      const value = Number(item[props.valueKey]) || 0;

      if (!groupedData.has(label)) {
        groupedData.set(label, new Map());
      }

      const labelData = groupedData.get(label)!;
      labelData.set(group, (labelData.get(group) || 0) + value);
      groups.add(group);
    } catch (error) {
      console.error('Ошибка обработки данных:', error, item);
    }
  });

  const labels = Array.from(groupedData.keys());
  const groupArray = Array.from(groups);
  const colors = generateColors(groupArray.length);

  const datasets = groupArray.map((group, index) => {
    const data = labels.map(label => {
      const labelData = groupedData.get(label);
      return labelData ? (labelData.get(group) || 0) : 0;
    });

    return {
      label: group,
      data: data,
      backgroundColor: colors[index],
      borderColor: colors[index],
      borderWidth: 1
    };
  });

  if (!chartCanvas.value) return;

  chartInstance = new Chart(chartCanvas.value as ChartItem, {
    type: props.chartType,
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: props.title
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: getYAxisLabel()
          }
        },
        x: {
          title: {
            display: true,
            text: getXAxisLabel()
          }
        }
      }
    }
  });
};

const createSimpleChart = () => {
  const labels: string[] = [];
  const values: number[] = [];
  
  props.data.forEach(item => {
    try {
      const label = String(item[props.labelKey] || '');
      const value = Number(item[props.valueKey]) || 0;
      
      labels.push(label);
      values.push(value);
    } catch (error) {
      console.error('Ошибка обработки данных:', error, item);
    }
  });

  if (!chartCanvas.value) return;

  chartInstance = new Chart(chartCanvas.value as ChartItem, {
    type: props.chartType,
    data: {
      labels: labels,
      datasets: [{
        label: getChartLabel(),
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: props.title
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: getYAxisLabel()
          }
        },
        x: {
          title: {
            display: true,
            text: getXAxisLabel()
          }
        }
      }
    }
  });
};

const getChartLabel = (): string => {
  return props.valueKey === 'total_price' ? 'Общая стоимость' : 
         props.valueKey === 'quantity' ? 'Количество товаров' : 
         props.valueKey === 'count' ? 'Количество записей' : 'Значение';
};

const getYAxisLabel = (): string => {
  return props.valueKey === 'total_price' ? 'Стоимость (руб)' : 
         props.valueKey === 'count' ? 'Количество записей' : 'Количество товаров';
};

const getXAxisLabel = (): string => {
  return props.labelKey === 'warehouse' ? 'Склады' : 'Дата';
};

const generateColors = (count: number): string[] => {
  const colors = [
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 99, 132, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(255, 205, 86, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(40, 159, 64, 0.7)',
    'rgba(210, 99, 132, 0.7)'
  ];

  return colors.slice(0, count);
};

watch(() => props.data, () => {
  nextTick(() => {
    createChart();
  });
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    createChart();
  });
});
</script>

<style scoped>
.simple-chart {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.simple-chart h3 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.chart-container {
  position: relative;
  height: 300px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}
</style>