<script setup>
import Chart from "chart.js/auto";
import { formatCurrency } from "./../../utils";

const props = defineProps({
  chartTitle: {
    type: String,
    required: true,
  },
  hasilAngsuran: {
    type: Array,
    required: true,
  },
});

const data = {
  labels: props.hasilAngsuran.map((angsuran) => angsuran.Bulan),
  datasets: [
    {
      label: "Pokok",
      backgroundColor: "rgb(75, 192, 192)",
      data: props.hasilAngsuran.map((angsuran) => angsuran.AngsuranPokok),
    },
    {
      label: "Bunga",
      backgroundColor: "rgb(255, 99, 132)",
      data: props.hasilAngsuran.map((angsuran) => angsuran.AngsuranBunga),
    },
  ],
};

const getAngsuran = (month) => {
  return `Angsuran: ${formatCurrency(
    Number(props.hasilAngsuran[month - 1].AngsuranBunga) +
      Number(props.hasilAngsuran[month - 1].AngsuranPokok)
  )}`;
};

const config = {
  type: "bar",
  data: data,
  options: {
    plugins: {
      title: {
        display: true,
        text: props.chartTitle,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItem) => `Bulan ke-${tooltipItem[0].label}`,
          label: (tooltipItem) => {
            const label = tooltipItem.dataset.label || "";
            const value = tooltipItem.raw;
            return `${label}: ${formatCurrency(value)}`;
          },
          footer: (tooltipItem) => getAngsuran(tooltipItem[0].label),
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  },
};

onMounted(() => {
  const ctx = document.getElementById("chart-rate-difference");
  new Chart(ctx, config);
});
</script>

<template>
  <canvas id="chart-rate-difference"></canvas>
</template>
