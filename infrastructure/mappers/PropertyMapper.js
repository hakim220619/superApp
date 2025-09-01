// infrastructure/mappers/PropertyMapper.js
const Property = require("../../domain/entities/Property.js");

module.exports = class PropertyMapper {
  static #mapFields(source, fieldMap) {
    const result = {};
    for (const [targetKey, sourceKey] of Object.entries(fieldMap)) {
      if (sourceKey === null) {
        result[targetKey] = null;
      } else {
        result[targetKey] =
          source[sourceKey] !== undefined ? source[sourceKey] : null;
      }
    }
    return result;
  }

  static #reverseMap(fieldMap) {
    const reversed = {};
    for (const [domainKey, dtoKey] of Object.entries(fieldMap)) {
      if (dtoKey !== null) {
        reversed[dtoKey] = domainKey;
      }
    }
    return reversed;
  }

  // Reusable field mappings
  static pembandingMap = {
    id: "id",
    jenis_property: "jenis_property",
    foto: "foto",
    alamat_aset: "alamat_aset",
    koordinat: "koordinat",
    hak_kepemilikan: "hak_kepemilikan",
    luas_tanah: "luas_tanah",
    luas_bangunan: "luas_bangunan",
    row_jalan: "row_jalan",
    perkerasan_jalan: "perkerasan_jalan",
    posisi_aset: "posisi_aset",
    bentuk_tanah: "bentuk_tanah",
    lebar_muka: "lebar_muka",
    elevansi_terhadap_jalan: "elevansi_terhadap_jalan",
    topografi: "topografi",
    orientasi: "orientasi",
    peruntukan: "peruntukan",
    jarak_thd_pusat_kota: "jarak_thd_pusat_kota",
    aksesibilitas_n_lokasi: "aksesibilitas_n_lokasi",
    kondisi_lingkungan: "kondisi_lingkungan",
    status_data: "status_data",
    created_at: "created_at",
    updated_at: "updated_at",
  };

  static tanahMap = {
    id: "id",
    jenis_property: "jenis_aset",
    foto: "foto_foto",
    alamat_aset: "alamat_aset",
    koordinat: "koordinat",
    hak_kepemilikan: "hak_kepemilikan",
    luas_tanah: "luas_tanah_m2",
    luas_bangunan: "luas_bangunan_m2",
    row_jalan: "row_jalan_m",
    perkerasan_jalan: "perkerasan_jalan",
    posisi_aset: "posisi_aset",
    bentuk_tanah: "bentuk_tanah",
    lebar_muka: "lebar_muka_m",
    elevansi_terhadap_jalan: "elevasi_terhadap_jalan_m",
    topografi: "topografi",
    orientasi: "orientasi",
    peruntukan: "peruntukan",
    jarak_thd_pusat_kota: "jarak_terhadap_pusat_kota",
    aksesibilitas_n_lokasi: "aksesibilitas_lokasi",
    kondisi_lingkungan: "kondisi_lingkungan",
    status_data: null, // tanah table doesn't have this
    created_at: "created_at",
    updated_at: "updated_at",
  };

  // Domain creation
  static fromPembandingDTO(dto) {
    return new Property(this.#mapFields(dto, this.pembandingMap));
  }

  static fromTanahDTO(dto) {
    return new Property(this.#mapFields(dto, this.tanahMap));
  }

  // Reverse mapping using the same config
  static toPembandingDTO(property) {
    return this.#mapFields(property, this.#reverseMap(this.pembandingMap));
  }

  static toTanahDTO(property) {
    return this.#mapFields(property, this.#reverseMap(this.tanahMap));
  }
};
