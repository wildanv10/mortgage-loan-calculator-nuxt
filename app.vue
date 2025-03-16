<script setup>
import { ref } from "vue";

const inputs = ref({
  hargaProperty: 0,
  dp: 0,
  tenor: 0,
  fixedRate: 0,
  fixedTenor: 0,
  floatingRate: 0,
  floatingTenor: 0,
});
const hasil = ref([]);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    currency: "IDR",
  }).format(value);
};

const parseNumber = (value) => parseInt(value.replace(/\./g, "")) || 0;

const formattedValue = (field) =>
  computed({
    get: () => formatCurrency(inputs.value[field]),
    set: (val) => (inputs.value[field] = parseNumber(val)),
  });

const formattedHargaProperty = formattedValue("hargaProperty");
const formattedDp = formattedValue("dp");
const formattedTenor = formattedValue("tenor");
const formattedFixedTenor = formattedValue("fixedTenor");
const formattedFloatingTenor = formattedValue("floatingTenor");

const updateValue = (field, event) => {
  const rawValue = event.target.value.replace(/[^0-9]/g, "");
  inputs.value[field] = parseInt(rawValue) || 0;
};

const formatRateInput = (field, event) => {
  let value = event.target.value.replace(/[^0-9.]/g, "");
  if (value.includes("..")) value = value.replace("..", ".");
  if (parseFloat(value) > 100) value = "100";
  inputs.value[field] = value;
};

const hitungKPR = () => {
  const pinjaman = inputs.value.hargaProperty - inputs.value.dp;
  let sisaPokok = pinjaman;
  let bulan = 1;
  hasil.value = [];

  for (let tahun = 1; tahun <= inputs.value.tenor; tahun++) {
    const rate =
      tahun <= inputs.value.fixedTenor
        ? inputs.value.fixedRate / 100 / 12
        : tahun <= inputs.value.fixedTenor + inputs.value.floatingTenor
        ? inputs.value.floatingRate / 100 / 12
        : inputs.value.floatingRate / 100 / 12;
    const totalBulan = 12;
    const angsuranBulanan =
      (sisaPokok * rate) /
      (1 -
        Math.pow(1 + rate, -((inputs.value.tenor - tahun + 1) * totalBulan)));

    for (let i = 0; i < totalBulan; i++) {
      const angsuranBunga = sisaPokok * rate;
      const angsuranPokok = angsuranBulanan - angsuranBunga;
      sisaPokok -= angsuranPokok;

      hasil.value.push({
        Tahun: tahun,
        Bulan: bulan++,
        AngsuranBulanan: angsuranBulanan.toFixed(0),
        AngsuranBunga: angsuranBunga.toFixed(0),
        AngsuranPokok: angsuranPokok.toFixed(0),
        SisaPokok: sisaPokok.toFixed(0),
      });
    }
  }
};
</script>

<template>
  <div>
    <header>
      <h2>Kalkulator KPR</h2>
    </header>
    <section>
      <form @submit.prevent="hitungKPR">
        <label>
          Harga Property:
          <input
            v-model="formattedHargaProperty"
            @input="updateValue('hargaProperty', $event)"
          />
        </label>
        <label>
          DP:
          <input v-model="formattedDp" @input="updateValue('dp', $event)" />
        </label>
        <label>
          Tenor (tahun):
          <input
            v-model="formattedTenor"
            @input="updateValue('tenor', $event)"
          />
        </label>
        <label>
          Fixed Rate (%):
          <input
            v-model="inputs.fixedRate"
            type="text"
            @input="formatRateInput('fixedRate', $event)"
          />
        </label>
        <label>
          Fixed Tenor (tahun):
          <input
            v-model="formattedFixedTenor"
            @input="updateValue('fixedTenor', $event)"
          />
        </label>
        <label>
          Floating Rate (%):
          <input
            v-model="inputs.floatingRate"
            type="text"
            @input="formatRateInput('floatingRate', $event)"
          />
        </label>
        <label>
          Floating Tenor (tahun):
          <input
            v-model="formattedFloatingTenor"
            @input="updateValue('floatingTenor', $event)"
          />
        </label>
        <button type="submit">Hitung</button>
      </form>
    </section>

    <section>
      <table v-if="hasil.length">
        <thead>
          <tr>
            <th>Tahun</th>
            <th>Bulan</th>
            <th>Angsuran Bulanan</th>
            <th>Angsuran Bunga</th>
            <th>Angsuran Pokok</th>
            <th>Sisa Pokok</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in hasil" :key="index">
            <td>{{ item.Tahun }}</td>
            <td>{{ item.Bulan }}</td>
            <td>{{ formatCurrency(item.AngsuranBulanan) }}</td>
            <td>{{ formatCurrency(item.AngsuranBunga) }}</td>
            <td>{{ formatCurrency(item.AngsuranPokok) }}</td>
            <td>{{ formatCurrency(item.SisaPokok) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
