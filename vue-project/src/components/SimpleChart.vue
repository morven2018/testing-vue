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
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartDataItem {
  date: string;
  quantity: number;
}

interface Props {
  data: ChartDataItem[];
  title: string;
}

const props = defineProps<Props>();

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: Chart | null = null;

const createChart = () => {
  if (!chartCanvas.value || !props.data || props.data.length === 0) {
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  const dataByDate = new Map<string, number>();
  
  props.data.forEach(item => {
    const date = new Date(item.date).toLocaleDateString('ru-RU');
    const quantity = item.quantity || 0;
    
    dataByDate.set(date, (dataByDate.get(date) || 0) + quantity);
  });

  const sortedDates = Array.from(dataByDate.keys()).sort((a, b) => {
    return new Date(a.split('.').reverse().join('-')).getTime() - 
           new Date(b.split('.').reverse().join('-')).getTime();
  });

  const quantities = sortedDates.map(date => dataByDate.get(date) || 0);

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: sortedDates,
      datasets: [{
        label: 'Количество товаров',
        data: quantities,
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
          text: 'Поступления по дням'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Количество товаров'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Дата'
          }
        }
      }
    }
  });
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