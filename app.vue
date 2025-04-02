<script setup>
import { ref } from "vue";
import { formatCurrency, parseNumber } from "./utils";

const isCalculating = ref(false);
const inputs = ref({
  hargaProperty: 500000000,
  dp: 100000000,
  tenor: 15,
  fixedRate: 4,
  fixedTenor: 3,
  floatingRate: 11,
  floatingTenor: 12,
});
const hasil = ref([]);
const hasilBarisRefs = ref([]);
const totalAngsuran = ref(0);
const totalBunga = ref(0);
const totalPokok = ref(0);

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

const hitungKPR = async () => {
  const pinjaman = inputs.value.hargaProperty - inputs.value.dp;
  let sisaPokok = pinjaman;
  let bulan = 1;
  hasil.value = [];
  hasilBarisRefs.value = [];
  isCalculating.value = true;
  await nextTick();

  try {
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
          AngsuranBulanan: angsuranBulanan,
          AngsuranBunga: angsuranBunga,
          AngsuranPokok: angsuranPokok,
          SisaPokok: sisaPokok,
        });
      }
    }
  } catch (error) {
    console.error(error);
  }

  isCalculating.value = false;

  await nextTick();
  getInstallmentSummarized();
  showTable();
};

const getInstallmentSummarized = () => {
  hasil.value.forEach((angsuran) => {
    totalAngsuran.value += Number(angsuran.AngsuranBulanan);
    totalBunga.value += Number(angsuran.AngsuranBunga);
    totalPokok.value += Number(angsuran.AngsuranPokok);
  });
};

const showTable = () => {
  hasilBarisRefs.value.forEach((el, index) => {
    let interval = 50;

    if (index <= 24) {
      interval = index * 50;
    } else if (index > 24) {
      interval = 0;
    }

    setTimeout(() => {
      el.classList.remove("opacity-0");
      el.classList.remove("leading-0");
      el.classList.remove("border-0");
      el.classList.add("not-last:border-b");
    }, interval);
  });
};
</script>

<template>
  <div class="container mx-auto">
    <section class="flex flex-col lg:flex-row gap-4">
      <!-- Input Form -->
      <div>
        <div
          class="sticky top-6 lg:top-10 shadow-lg outline outline-black/5 bg-white rounded-2xl p-4"
        >
          <h2 class="text-2xl font-bold mb-10">Simulasi KPR</h2>
          <form class="flex flex-col gap-6" @submit.prevent="hitungKPR">
            <!-- Harga Properti -->
            <div>
              <label
                class="flex flex-col sm:flex-row sm:justify-between items-center gap-2"
              >
                <span class="w-full sm:w-44 font-semibold">
                  Harga Properti
                </span>
                <div class="relative border-none rounded-none w-full sm:w-60">
                  <input
                    id="inputHargaProperty"
                    v-model="formattedHargaProperty"
                    class="border border-gray-300 rounded-md py-2 px-4 w-full sm:w-60"
                    autofocus
                    @input="updateValue('hargaProperty', $event)"
                  />
                </div>
              </label>
            </div>

            <!-- DP -->
            <div>
              <label
                class="flex flex-col sm:flex-row sm:justify-between items-center gap-2"
              >
                <span class="w-full sm:w-44 font-semibold"> DP </span>
                <div class="relative border-none rounded-none w-full sm:w-60">
                  <input
                    id="inputDP"
                    v-model="formattedDp"
                    class="border border-gray-300 rounded-md py-2 px-4 w-full sm:w-60"
                    autofocus
                    @input="updateValue('dp', $event)"
                  />
                </div>
              </label>
            </div>

            <!-- Tenor -->
            <div>
              <label
                class="flex flex-col sm:flex-row sm:justify-between items-center gap-2"
              >
                <span class="w-full sm:w-44 font-semibold"> Tenor </span>
                <div class="relative border-none rounded-none w-full sm:w-60">
                  <input
                    id="inputTenor"
                    v-model="formattedTenor"
                    class="border border-gray-300 rounded-md py-2 px-4 w-full sm:w-60"
                    autofocus
                    @input="updateValue('tenor', $event)"
                  />
                  <span
                    class="absolute right-0 top-1.5 px-4 py-1 border-l border-gray-200 text-gray-500 text-sm"
                  >
                    Tahun
                  </span>
                </div>
              </label>
            </div>

            <!-- Fixed Rate -->
            <div class="flex flex-col sm:flex-row items-center gap-2">
              <label class="flex w-full" for="inputFixedRate">
                <span class="w-full sm:w-44 font-semibold"> Fixed Rate </span>
              </label>
              <div class="flex items-center gap-4 sm:w-64 w-full">
                <div class="relative grow sm:w-28">
                  <input
                    id="inputFixedRate"
                    v-model="inputs.fixedRate"
                    class="border border-gray-300 rounded-md py-2 px-4 w-full"
                    @input="formatRateInput('fixedRate', $event)"
                  />
                  <label for="inputFixedRate">
                    <span
                      class="absolute right-0 top-1.5 px-4 py-1 border-l border-gray-200 text-gray-500 text-sm"
                    >
                      %
                    </span>
                  </label>
                </div>

                <div class="relative grow sm:w-28">
                  <input
                    id="inputFixedTenor"
                    v-model="formattedFixedTenor"
                    class="border border-gray-300 rounded-md py-2 px-4 w-full"
                    @input="updateValue('fixedTenor', $event)"
                  />
                  <label for="inputFixedTenor">
                    <span
                      class="absolute right-0 top-1.5 px-4 py-1 border-l border-gray-200 text-gray-500 text-sm"
                    >
                      Tahun
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Floating Rate -->
            <div class="flex flex-col sm:flex-row items-center gap-2">
              <label class="flex w-full" for="inputFloatingRate">
                <span class="w-full sm:w-44 font-semibold">Floating Rate</span>
              </label>
              <div class="flex items-center gap-4 sm:w-64 w-full">
                <div class="relative grow sm:w-28">
                  <input
                    id="inputFloatingRate"
                    v-model="inputs.floatingRate"
                    class="border border-gray-300 rounded-md py-2 px-4 w-full"
                    @input="formatRateInput('floatingRate', $event)"
                  />
                  <label for="inputFloatingRate">
                    <span
                      class="absolute right-0 top-1.5 px-4 py-1 border-l border-gray-200 text-gray-500 text-sm"
                    >
                      %
                    </span>
                  </label>
                </div>

                <div class="relative grow sm:w-28">
                  <input
                    id="inputFloatingTenor"
                    v-model="formattedFloatingTenor"
                    class="border border-gray-300 rounded-md py-2 px-4 w-full"
                    @input="updateValue('floatingTenor', $event)"
                  />
                  <label for="inputFloatingTenor">
                    <span
                      class="absolute right-0 top-1.5 px-4 py-1 border-l border-gray-200 text-gray-500 text-sm"
                    >
                      Tahun
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="px-6 py-3.5 text-base font-medium text-white inline-flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:outline-none focus:ring-cyan-200 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg
                v-if="isCalculating"
                aria-hidden="true"
                role="status"
                class="inline w-4 h-4 me-3 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              Hitung
            </button>
          </form>
        </div>
      </div>

      <!-- Right Section -->
      <section class="h-dvh">
        <!-- Results Table -->
        <section
          class="lg:h-1/2 rounded-lg overflow-auto mt-6 lg:mt-10 mb-6 lg:mb-10"
        >
          <table
            v-if="hasil.length"
            class="relative border border-gray-100 table-auto w-full text-md text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="sticky top-0 text-gray-700 uppercase dark:text-gray-400 border-y border-gray-300 bg-gray-200"
            >
              <tr>
                <th class="px-6 py-3 text-center">Tahun</th>
                <th class="px-6 py-3 text-center">Bulan</th>
                <th class="px-6 py-3 text-center">Angsuran Bulanan</th>
                <th class="px-6 py-3 text-center">Angsuran Bunga</th>
                <th class="px-6 py-3 text-center">Angsuran Pokok</th>
                <th class="px-6 py-3 text-center">Sisa Pokok</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 bg-gray-100 *:px-6 *:py-2"
              >
                <td colspan="5">Pinjaman</td>
                <td class="text-right">
                  {{ formatCurrency(inputs.hargaProperty - inputs.dp) }}
                </td>
              </tr>
              <tr
                v-for="(item, index) in hasil"
                :ref="(el) => (hasilBarisRefs[index] = el)"
                :key="index"
                class="border-gray-200 dark:border-gray-700 hover:bg-gray-50 *:px-6 *:py-2"
                :class="{
                  'bg-gray-100': item.Tahun % 2 === 0,
                  'transition-[opacity] duration-200 ease-in-out': true,
                  'opacity-0 leading-0 border-0 p-0': true,
                }"
              >
                <td class="text-center">{{ item.Tahun }}</td>
                <td class="text-center">{{ item.Bulan }}</td>
                <td class="text-right">
                  {{ formatCurrency(item.AngsuranBulanan) }}
                </td>
                <td class="text-right">
                  {{ formatCurrency(item.AngsuranBunga) }}
                </td>
                <td class="text-right">
                  {{ formatCurrency(item.AngsuranPokok) }}
                </td>
                <td class="text-right">
                  {{ formatCurrency(item.SisaPokok) }}
                </td>
              </tr>
            </tbody>
            <tfoot
              class="text-gray-700 uppercase dark:text-gray-400 border-y border-gray-300 bg-gray-200"
            >
              <tr>
                <td class="px-6 py-3 text-center"></td>
                <td class="px-6 py-3 text-center"></td>
                <td class="px-6 py-3 text-right">
                  {{ formatCurrency(totalAngsuran) }}
                </td>
                <td class="px-6 py-3 text-right">
                  {{ formatCurrency(totalBunga) }}
                </td>
                <td class="px-6 py-3 text-right">
                  {{ formatCurrency(totalPokok) }}
                </td>
                <td class="px-6 py-3 text-center"></td>
              </tr>
            </tfoot>
          </table>
        </section>

        <!-- Chart -->
        <section>
          <ChartRateDifference v-if="hasil.length" :hasil-angsuran="hasil" />
        </section>
      </section>
    </section>
  </div>
</template>
