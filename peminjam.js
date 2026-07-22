// Menjalankan fungsi saat halaman selesai dimuat
window.onload = function() {
    isiDropdownPeminjaman();
    displayPeminjaman();

    const formPeminjaman = document.getElementById("formPeminjaman");
    if (formPeminjaman) {
        formPeminjaman.onsubmit = function(e) {
            e.preventDefault(); 
            addPeminjaman();
        };
    }
};

// FUNGSI FILTER: Mengisi dropdown dan menyembunyikan buku yang sedang dipinjam
function isiDropdownPeminjaman() {
    const selectAnggota = document.getElementById("peminjam-nama");
    const selectBuku = document.getElementById("peminjam-buku");
    if (!selectAnggota || !selectBuku) return;

    const dataAnggota = JSON.parse(localStorage.getItem("Daftar_Anggota")) || [];
    const dataBuku = JSON.parse(localStorage.getItem("Daftar_Buku")) || [];
    const dataPeminjaman = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];

    // Filter judul buku yang statusnya masih "Pinjam"
    const bukuSedangDipinjam = dataPeminjaman
        .filter(p => p.status === "Pinjam")
        .map(p => p.judul);

    // Hanya tampilkan buku yang tidak ada di daftar buku Sedang dipinjam
    const bukuTersedia = dataBuku.filter(bk => !bukuSedangDipinjam.includes(bk.judul));

    selectAnggota.innerHTML = '<option value="">-- Pilih Anggota --</option>';
    selectBuku.innerHTML = '<option value="">-- Pilih Buku --</option>';

    dataAnggota.forEach(agt => {
        let opt = document.createElement("option");
        opt.value = agt.nama; opt.innerText = agt.nama;
        selectAnggota.appendChild(opt);
    });

    if (bukuTersedia.length === 0 && dataBuku.length > 0) {
        let opt = document.createElement("option");
        opt.innerText = "Semua buku sedang dipinjam";
        opt.disabled = true;
        selectBuku.appendChild(opt);
    } else {
        bukuTersedia.forEach(bk => {
            let opt = document.createElement("option");
            opt.value = bk.judul; opt.innerText = bk.judul;
            selectBuku.appendChild(opt);
        });
    }
}

function addPeminjaman() {
    const nama = document.getElementById("peminjam-nama").value;
    const judul = document.getElementById("peminjam-buku").value;
    const tanggal = document.getElementById("peminjam-tanggal").value;
    const status = document.getElementById("peminjam-status").value;

    if (!nama || !judul || !tanggal) {
        Swal.fire("Peringatan", "Lengkapi semua data!", "warning");
        return;
    }

    Swal.fire({
        title: "Menyimpan Data...",
        text: "Sedang memproses peminjaman",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
        const peminjamanBaru = { nama, judul, tanggal, status };

        let listPeminjaman = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
        listPeminjaman.push(peminjamanBaru);
        localStorage.setItem("Daftar_Peminjaman", JSON.stringify(listPeminjaman));

        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data telah ditambahkan.",
            timer: 1500,
            showConfirmButton: false
        });

        displayPeminjaman(); 
        isiDropdownPeminjaman(); // Update dropdown setelah tambah
        document.getElementById("formPeminjaman").reset();
    }, 1000);
}

function displayPeminjaman() {
    const tabelBody = document.getElementById("tabelPeminjaman");
    if (!tabelBody) return;

    const listPeminjaman = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
    tabelBody.innerHTML = ""; 

    listPeminjaman.forEach((item, index) => {
        const isPinjam = item.status === "Pinjam";
        const badgeClass = isPinjam ? "bg-warning text-dark" : "bg-success text-white";
        
        // Logika Tanggal Kembali: Jika belum dikembalikan, tampilkan strip (-)
        const tglKembali = item.tanggal_kembali ? item.tanggal_kembali : "-";

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.nama}</td>
                <td>${item.judul}</td>
                <td>${item.tanggal}</td>
                <td>${tglKembali}</td> <td><span class="badge ${badgeClass}">${item.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="printRincian(${index})"><i class="bi bi-printer"></i></button>
                    ${isPinjam ? `<button class="btn btn-sm btn-success" onclick="kembalikanBuku(${index})">Kembalikan</button>` : ''}
                    <button class="btn btn-sm btn-primary" onclick="editPeminjaman(${index})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePeminjaman(${index})">Hapus</button>
                </td>
            </tr>`;
        tabelBody.insertAdjacentHTML("beforeend", row);
    });
}

function kembalikanBuku(index) {
    let listPeminjaman = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
    const today = new Date().toISOString().split('T')[0];

    Swal.fire({
        title: "Kembalikan Buku?",
        text: "Buku akan dikembalikan dan struk pengembalian akan dicetak.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Kembalikan & Cetak!"
    }).then((result) => {
        if (result.isConfirmed) {
            // Update data
            listPeminjaman[index].status = "Kembali";
            listPeminjaman[index].tanggal_kembali = today;

            localStorage.setItem("Daftar_Peminjaman", JSON.stringify(listPeminjaman));
            
            displayPeminjaman();
            isiDropdownPeminjaman();
            
            // struck otomatis
            printRincian(index);

            Swal.fire("Berhasil", "Buku dikembalikan dan struk siap dicetak.", "success");
        }
    });
}

function deletePeminjaman(index) {
    Swal.fire({
        title: "Hapus data?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus!"
    }).then((result) => {
        if (result.isConfirmed) {
            let listPeminjaman = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
            listPeminjaman.splice(index, 1);
            localStorage.setItem("Daftar_Peminjaman", JSON.stringify(listPeminjaman));
            
            displayPeminjaman();
            isiDropdownPeminjaman(); // Update dropdown agar buku muncul lagi
        }
    });
}

function editPeminjaman(index) {
    let listPeminjaman = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
    const item = listPeminjaman[index];

    // Isi form dengan data lama
    document.getElementById("peminjam-nama").value = item.nama;
    document.getElementById("peminjam-tanggal").value = item.tanggal;
    document.getElementById("peminjam-status").value = item.status;

    // Tambahkan judul buku yang sedang diedit kembali ke dropdown agar bisa dipilih
    isiDropdownPeminjaman();
    const selectBuku = document.getElementById("peminjam-buku");
    let opt = document.createElement("option");
    opt.value = item.judul;
    opt.innerText = item.judul;
    opt.selected = true;
    selectBuku.appendChild(opt);

    listPeminjaman.splice(index, 1);
    localStorage.setItem("Daftar_Peminjaman", JSON.stringify(listPeminjaman));
    displayPeminjaman();

    Swal.fire({
        icon: "info",
        title: "Mode Edit",
        text: "Data dimuat ke form. Silakan ubah dan klik Tambah kembali.",
    });
}

function printRincian(index) {
    const listPeminjaman = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
    const data = listPeminjaman[index];
    if (!data) return;

     
    const barisKembali = data.tanggal_kembali 
        ? `<div class="item"><span>Tgl Kembali:</span> <span>${data.tanggal_kembali}</span></div>` 
        : "";

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Struk - ${data.nama}</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
                .container { border: 2px dashed #4A69FF; padding: 20px; width: 300px; margin: auto; }
                h2 { color: #4A69FF; margin-bottom: 5px; text-transform: uppercase; }
                .item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                .status-box { margin-top: 15px; padding: 5px; border: 1px solid #333; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>LAB BOOK</h2>
                <p>Bukti Transaksi Perpustakaan</p>
                <hr>
                <div class="item"><span>Nama:</span> <span>${data.nama}</span></div>
                <div class="item"><span>Buku:</span> <span>${data.judul}</span></div>
                <div class="item"><span>Tgl Pinjam:</span> <span>${data.tanggal}</span></div>
                ${barisKembali}
                <div class="status-box">Status: ${data.status.toUpperCase()}</div>
                <p style="margin-top:20px; font-size: 11px;">Terima kasih telah menggunakan layanan Lab Book.</p>
            </div>
            <script>
                window.onload = function() { 
                    window.print(); 
                    window.onafterprint = function() { window.close(); };
                }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
