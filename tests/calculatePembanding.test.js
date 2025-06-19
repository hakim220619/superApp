// __tests__/calculatePembanding.test.js
const calculatePembanding = require("../service/core/calculatePembanding");

test("calculates after_diskon and formatted values correctly", () => {
  const input = [
    {
      id: 2,
      jenis_property: 'Ruko',
      foto: 'foto2.jpg',
      sumber_informasi: 'Pemilik Langsung',
      kategori_sumber_informasi: 'Individu',
      no_hp: '08765432123',
      jenis_data: 0,
      tgl_penawaran: '2023-10-01',
      harga_penawaran: 100000000,
      diskon: 5,
      alamat_aset: 'Jl. Thamrin No. 5, Jakarta',
      koordinat: '-6.195000,106.820000',
      hak_kepemilikan: 'SHGB',
      luas_tanah: 150,
      luas_bangunan: 300,
      tahun_dibangun: '2015',
      tahun_renovasi: '',
      tipe_bangunan: 'Kompleks',
      jumlah_lantai: 3,
      kondisi_bangunan: 'Sangat Baik',
      row_jalan: 10,
      perkerasan_jalan: 'Aspal',
      posisi_aset: 'Tengah',
      bentuk_tanah: 'Persegi Panjang',
      lebar_muka: 8,
      elevansi_terhadap_jalan: 'Lebih tinggi',
      topografi: 'Datar',
      orientasi: 'Timur',
      peruntukan: 'Komercial',
      jarak_thd_pusat_kota: 3,
      aksesibilitas_n_lokasi: 'Sangat mudah diakses',
      kondisi_lingkungan: 'Ramai',
      syarat_pembiayaan: 'Cash',
      kondisi_penjualan: '',
      pengeluaran_stlh_pembelian: '15000000',
      kondisi_pasar: 'Normal'
    },
  ];
  const result = calculatePembanding(input);
  expect(result[0].unit_perbandingan.indikasi_sewa).toBe(95000000);
  expect(result[0].unit_perbandingan.indikasi_sewa_m2).toBe(633333);
  const expected = "Rp 95.000.000";
  const received = result[0].unit_perbandingan.indikasi_sewa_rp;
  expect(received).toBe(expected);
});
