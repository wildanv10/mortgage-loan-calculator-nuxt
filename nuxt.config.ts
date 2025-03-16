// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  app: {
    head: {
      title: 'Simulasi KPR',
      htmlAttrs: {
        lang: 'id',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      meta: [
        { name: 'description', content: 'Gunakan Kalkulator KPR online untuk menghitung angsuran rumah dengan mudah. Simulasi Kredit Pemilikan Rumah (KPR) berdasarkan harga properti, DP, suku bunga tetap & mengambang, serta tenor pinjaman.' }
      ],
    }
  }
})
