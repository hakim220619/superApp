// domain/entities/Property.js
class Property {
  constructor({
    id,
    jenis_property,
    foto,
    alamat_aset,
    koordinat,
    hak_kepemilikan,
    luas_tanah,
    luas_bangunan,
    row_jalan,
    perkerasan_jalan,
    posisi_aset,
    bentuk_tanah,
    lebar_muka,
    elevansi_terhadap_jalan,
    topografi,
    orientasi,
    peruntukan,
    jarak_thd_pusat_kota,
    aksesibilitas_n_lokasi,
    kondisi_lingkungan,
    status_data,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.jenis_property = jenis_property;
    this.foto = foto;
    this.alamat_aset = alamat_aset;
    this.koordinat = koordinat;
    this.hak_kepemilikan = hak_kepemilikan;
    this.luas_tanah = luas_tanah;
    this.luas_bangunan = luas_bangunan;
    this.row_jalan = row_jalan;
    this.perkerasan_jalan = perkerasan_jalan;
    this.posisi_aset = posisi_aset;
    this.bentuk_tanah = bentuk_tanah;
    this.lebar_muka = lebar_muka;
    this.elevansi_terhadap_jalan = elevansi_terhadap_jalan;
    this.topografi = topografi;
    this.orientasi = orientasi;
    this.peruntukan = peruntukan;
    this.jarak_thd_pusat_kota = jarak_thd_pusat_kota;
    this.aksesibilitas_n_lokasi = aksesibilitas_n_lokasi;
    this.kondisi_lingkungan = kondisi_lingkungan;
    this.status_data = status_data;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Example domain method
  isLargeLand() {
    return this.luas_tanah > 500;
  }
}

module.exports = Property;
