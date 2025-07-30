const Pembanding = require('../models/pembandingModel');
const response = require('../../../config/helpers/response');
const path = require('path');
const fs = require('fs');

const getAllPembanding = async (req, res) => {
    try {
        const pembanding = await Pembanding.findAll();
        response.success(res, 'Data pembanding berhasil diambil', pembanding);
    } catch (err) {
        console.error('Error getAllPembanding:', err);
        response.error(res, 'Server error', err);
    }
};

const getPembandingById = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await Pembanding.findBy(id);
        if (!data) return response.error(res, 'Data pembanding tidak ditemukan', null, 404);
        
        // Parsing foto jika tersimpan sebagai JSON string
        if (data.foto && typeof data.foto === 'string') {
            try {
                data.foto = JSON.parse(data.foto);
            } catch (e) {
                console.warn('Failed to parse foto JSON from DB:', e);
                data.foto = [];
            }
        } else if (!data.foto) {
             data.foto = [];
        }

        // Parsing koordinat jika tersimpan sebagai JSON string
        if (data.koordinat && typeof data.koordinat === 'string') {
            try {
                data.koordinat = JSON.parse(data.koordinat);
            } catch (e) {
                console.warn('Failed to parse koordinat JSON from DB:', e);
                data.koordinat = null;
            }
        } else if (!data.koordinat) {
             data.koordinat = null;
        }


        response.success(res, 'Data pembanding berhasil diambil', data);
    } catch (err) {
        console.error('Error getPembandingById:', err);
        response.error(res, 'Server error', err);
    }
};

const createPembanding = async (req, res) => {
    try {
        console.log('CREATE PEMBANDING Request received.');
        console.log('Req Body (before processing files):', req.body);
        console.log('Req Files:', req.files);
        console.log('Folder Name (from params):', req.params.folderName);

        const body = req.body;
        const uploadedPhotosInfo = [];

        // --- PENANGANAN FOTO BARU YANG DIUPLOAD ---
        if (req.files && req.files.foto && Array.isArray(req.files.foto)) {
            req.files.foto.forEach(file => {
                const relativePath = path.relative(path.join(__dirname, '..', '..', '..'), file.path);
                uploadedPhotosInfo.push({
                    path: relativePath.replace(/\\/g, '/'),
                    filename: file.filename,
                    originalname: file.originalname,
                });
            });
        }
        body.foto = uploadedPhotosInfo.length > 0 ? JSON.stringify(uploadedPhotosInfo) : null;
        // --- AKHIR PENANGANAN FOTO ---

        // --- PENANGANAN KOORDINAT ---
        if (body.koordinat) {
            try {
              const koordinatArray = body.koordinat.split(',');
              if (koordinatArray.length === 2) {
                const latitude = parseFloat(koordinatArray[0]);
                const longitude = parseFloat(koordinatArray[1]);
                body.koordinat = JSON.stringify({ latitude : latitude, longitude : longitude });
              } else {
                console.warn('Invalid koordinat format, setting to NULL:');
                body.koordinat = null;
              }
            } catch (e) {
              console.warn('Invalid JSON for koordinat, setting to NULL:', e);
              body.koordinat = null;
            }
          } else {
            body.koordinat = null;
          }
        // --- AKHIR PENANGANAN KOORDINAT ---

        // PENTING: Lakukan mapping nama field frontend ke nama kolom database jika berbeda
        // Ini memastikan data yang dikirim ke model sesuai dengan nama kolom DB Anda
        const dataToSave = {
            jenis_property: body.jenis_property,
            foto: body.foto, // Sudah dalam format JSON string
            sumber_informasi: body.sumber_informasi,
            kategori_sumber_informasi: body.kategori_sumber_informasi,
            no_hp: body.no_hp,
            jenis_data: body.jenis_data,
            tgl_penawaran: body.tgl_penawaran,
            harga_penawaran: body.harga_penawaran,
            diskon: body.diskon,
            alamat_aset: body.alamat_aset,
            koordinat: body.koordinat, // Sudah dalam format JSON string
            hak_kepemilikan: body.hak_kepemilikan,
            luas_tanah: body.luas_tanah,
            luas_bangunan: body.luas_bangunan,
            tahun_dibangun: body.tahun_dibangun,
            tahun_renovasi: body.tahun_renovasi,
            tipe_bangunan: body.tipe_bangunan,
            jumlah_lantai: body.jumlah_lantai,
            kondisi_bangunan: body.kondisi_bangunan,
            row_jalan: body.row_jalan,
            perkerasan_jalan: body.perkerasan_jalan,
            posisi_aset: body.posisi_aset,
            bentuk_tanah: body.bentuk_tanah,
            lebar_muka: body.lebar_muka,
            elevansi_terhadap_jalan: body.elevasi_terhadap_jalan, // FE: elevasi_terhadap_jalan -> DB: elevansi_terhadap_jalan
            topografi: body.topografi,
            orientasi: body.orientasi,
            peruntukan: body.peruntukan,
            jarak_thd_pusat_kota: body.jarak_thd_pusat_kota, // FE: jarak_thd_pusat_kota -> DB: jarak_thd_pusat_kota
            aksesibilitas_n_lokasi: body.aksesibilitas_lokasi, // FE: aksesibilitas_lokasi -> DB: aksesibilitas_n_lokasi
            kondisi_lingkungan: body.kondisi_lingkungan,
            syarat_pembiayaan: body.syarat_pembiayaan,
            kondisi_penjualan: body.kondisi_penjualan,
            pengeluaran_stlh_pembelian: body.pengeluaran_setelah_pembelian, // FE: pengeluaran_setelah_pembelian -> DB: pengeluaran_stlh_pembelian
            kondisi_pasar: body.kondisi_pasar,
            status_data: body.status_data // Pastikan ini ada dari frontend dan di DB
        };

        const result = await Pembanding.createPembanding(dataToSave);

        return response.success(res, 'Data pembanding berhasil ditambahkan', result, 201);
    } catch (err) {
        console.error('Error in createPembanding controller:', err);
        return response.error(res, 'Gagal menambahkan data pembanding', err);
    }
};

const updatePembanding = async (req, res) => {
    const { id } = req.params;

    try {
        console.log('UPDATE PEMBANDING Request received.');
        console.log('Req ID:', id);
        console.log('Req Body (before processing files):', req.body);
        console.log('Req Files:', req.files);
        console.log('Folder Name (from params):', req.params.folderName);

        const body = req.body;
        const uploadedPhotosInfo = [];

        // --- PENANGANAN FOTO BARU YANG DIUPLOAD ---
        if (req.files?.foto && Array.isArray(req.files.foto)) {
            req.files.foto.forEach(file => {
                const relativePath = path.relative(path.join(__dirname, '..', '..', '..'), file.path);
                uploadedPhotosInfo.push({
                    path: relativePath.replace(/\\/g, '/'),
                    filename: file.filename,
                    originalname: file.originalname,
                });
            });
        }
        // --- AKHIR PENANGANAN FOTO BARU ---

        // --- PENANGANAN FOTO LAMA (EXISTING) DAN PENGGABUNGAN ---
        let finalPhotos = [];
        const currentPembanding = await Pembanding.findBy(id);
        if (currentPembanding && currentPembanding.foto) {
            try {
                const oldPhotosInDb = JSON.parse(currentPembanding.foto);
                if (uploadedPhotosInfo.length > 0) {
                    // Jika ada upload baru, secara sederhana kita akan mengganti semua foto.
                    // Untuk logika merge yang lebih canggih, frontend perlu mengirim ID/URL foto lama yang dipertahankan.
                    finalPhotos = uploadedPhotosInfo; 
                    // TODO: Implementasi penghapusan fisik file lama yang tidak lagi digunakan jika diperlukan.
                    // Ini memerlukan perbandingan `oldPhotosInDb` dengan `finalPhotos`
                    // dan kemudian menghapus file yang tidak ada di `finalPhotos`.
                } else {
                    finalPhotos = oldPhotosInDb; // Jika tidak ada upload baru, pertahankan yang lama dari DB
                }
            } catch (e) {
                console.warn('Failed to parse existing foto JSON from DB for update, using new uploads or null:', e);
                finalPhotos = uploadedPhotosInfo; // Gunakan yang baru diupload jika parsing lama gagal
            }
        } else {
            finalPhotos = uploadedPhotosInfo; // Tidak ada foto lama, hanya yang baru diupload
        }

        body.foto = finalPhotos.length > 0 ? JSON.stringify(finalPhotos) : null;
        // --- AKHIR PENANGANAN FOTO LAMA DAN PENGGABUNGAN ---

        // --- PENANGANAN KOORDINAT (Sama seperti create) ---
        if (body.koordinat) {
            try {
                let parsedKoordinat = body.koordinat;
                if (typeof body.koordinat === 'string') {
                    parsedKoordinat = JSON.parse(body.koordinat);
                }
                body.koordinat = JSON.stringify(parsedKoordinat);
            } catch (e) {
                console.warn('Invalid JSON for koordinat, setting to NULL:', e);
                body.koordinat = null;
            }
        } else {
            body.koordinat = null;
        }
        // --- AKHIR PENANGANAN KOORDINAT ---

        // PENTING: Lakukan mapping nama field frontend ke nama kolom database jika berbeda
        const dataToUpdate = {
            jenis_property: body.jenis_property,
            foto: body.foto,
            sumber_informasi: body.sumber_informasi,
            kategori_sumber_informasi: body.kategori_sumber_informasi,
            no_hp: body.no_hp,
            jenis_data: body.jenis_data,
            tgl_penawaran: body.tgl_penawaran,
            harga_penawaran: body.harga_penawaran,
            diskon: body.diskon,
            alamat_aset: body.alamat_aset,
            koordinat: body.koordinat,
            hak_kepemilikan: body.hak_kepemilikan,
            luas_tanah: body.luas_tanah,
            luas_bangunan: body.luas_bangunan,
            tahun_dibangun: body.tahun_dibangun,
            tahun_renovasi: body.tahun_renovasi,
            tipe_bangunan: body.tipe_bangunan,
            jumlah_lantai: body.jumlah_lantai,
            kondisi_bangunan: body.kondisi_bangunan,
            row_jalan: body.row_jalan,
            perkerasan_jalan: body.perkerasan_jalan,
            posisi_aset: body.posisi_aset,
            bentuk_tanah: body.bentuk_tanah,
            lebar_muka: body.lebar_muka,
            elevansi_terhadap_jalan: body.elevasi_terhadap_jalan, // MAPPING
            topografi: body.topografi,
            orientasi: body.orientasi,
            peruntukan: body.peruntukan,
            jarak_thd_pusat_kota: body.jarak_thd_pusat_kota, // MAPPING
            aksesibilitas_n_lokasi: body.aksesibilitas_lokasi, // MAPPING
            kondisi_lingkungan: body.kondisi_lingkungan,
            syarat_pembiayaan: body.syarat_pembiayaan,
            kondisi_penjualan: body.kondisi_penjualan,
            pengeluaran_stlh_pembelian: body.pengeluaran_setelah_pembelian, // MAPPING
            kondisi_pasar: body.kondisi_pasar,
            status_data: body.status_data // Pastikan ini ada dari frontend dan di DB
        };

        const updated = await Pembanding.update(id, dataToUpdate);

        return response.success(res, 'Data pembanding berhasil diperbarui', updated);
    } catch (err) {
        console.error('Error in updatePembanding controller:', err);
        return response.error(res, 'Gagal memperbarui data pembanding', err);
    }
};

const deletePembanding = async (req, res) => {
    const { id } = req.params;
    try {
        await Pembanding.remove(id);
        response.success(res, 'Data pembanding berhasil dihapus', null, 201);
    } catch (err) {
        console.error('Error deletePembanding:', err);
        response.error(res, 'Gagal menghapus data pembanding', err);
    }
};

module.exports = {
    getAllPembanding,
    getPembandingById,
    updatePembanding,
    deletePembanding,
    createPembanding
};