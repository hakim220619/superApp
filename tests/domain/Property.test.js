const PropertyMapper = require("../../infrastructure/mappers/PropertyMapper");
test("calculates after_diskon and formatted values correctly", () => {
  const propertyFromPembanding = PropertyMapper.fromPembandingDTO({
    id: 1,
    jenis_property: "Rumah",
    alamat_aset: "Jl. Merdeka",
    luas_tanah: 120,
  });

  const isLargeLand = propertyFromPembanding.isLargeLand();
  expect(isLargeLand).toBe(false);
  expect(propertyFromPembanding);
  const requiredKeys = [
    "id",
    "jenis_property",
    "alamat_aset",
    "luas_bangunan",
    "luas_tanah",
  ];
  requiredKeys.forEach((key) => {
    expect(propertyFromPembanding).toHaveProperty(key);
  });

  const propertyFromTanah = PropertyMapper.fromTanahDTO({
    id: 2,
    jenis_aset: "Tanah",
    alamat_aset: "Jl. Kebangsaan",
    luas_tanah_m2: 200,
    luas_bangunan_m2: 0,
    row_jalan_m: 10,
    perkerasan_jalan: "Aspal",
    posisi_aset: "Tepi Jalan",
  });
  requiredKeys.forEach((key) => {
    expect(propertyFromTanah).toHaveProperty(key);
  });
  expect(propertyFromTanah.luas_tanah).toBe(200);
  expect(propertyFromTanah.luas_bangunan).toBe(0);
  expect(propertyFromTanah.row_jalan).toBe(10);
  expect(propertyFromTanah.perkerasan_jalan).toBe("Aspal");
  expect(propertyFromTanah.posisi_aset).toBe("Tepi Jalan");
  expect(propertyFromTanah).toMatchObject({
    id: 2,
    jenis_property: "Tanah",
    alamat_aset: "Jl. Kebangsaan",
    luas_tanah: 200,
    luas_bangunan: 0,
    row_jalan: 10,
    perkerasan_jalan: "Aspal",
    posisi_aset: "Tepi Jalan",

  });
});
