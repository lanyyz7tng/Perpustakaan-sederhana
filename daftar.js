// --- KONFIGURASI NAMA KEY LOCALSTORAGE ---
const KEY_BUKU = "Daftar_Buku";
const KEY_PEMINJAMAN = "Daftar_Peminjaman";
const KEY_ANGGOTA = "Daftar_Anggota";

// Fungsi utama yang berjalan saat halaman dimuat
window.onload = function() {
    if (document.getElementById("count-buku")) {
        renderDashboard();
    }

    const formBuku = document.getElementById("formBuku");
    if (formBuku) {
        displayBooks();
        formBuku.onsubmit = function(e) {
            e.preventDefault();
            addBook();
        };
    }
};


// --- LOGIKA HALAMAN DAFTAR BUKU ---

function addBook() {
    const judul = document.getElementById("judul").value;
    const penulis = document.getElementById("penulis").value;
    const tahun = document.getElementById("tahun").value;

    if (!judul || !penulis || !tahun) {
        Swal.fire("Peringatan", "Lengkapi semua data!", "warning");
        return;
    }

    
    Swal.fire({
        title: "Sedang Memproses",
        text: "Menyimpan data ke sistem...",
        allowOutsideClick: false,
        showConfirmButton: false, 
        didOpen: () => {
            Swal.showLoading(); 
        }
    });

   
    setTimeout(() => {
        // Ambil dan simpan data ke LocalStorage
        let books = JSON.parse(localStorage.getItem(KEY_BUKU)) || [];
        books.push({ judul, penulis, tahun });
        localStorage.setItem(KEY_BUKU, JSON.stringify(books));

        
        Swal.fire({
            icon: "success",
            title: "Data Tersimpan!",
            text: "Buku berhasil ditambahkan.",
            timer: 1500, // Hilang otomatis dalam 1.5 detik
            showConfirmButton: false
        });

        // Reset form dan update tampilan tabel
        document.getElementById("formBuku").reset();
        displayBooks();
        if (typeof updateSummary === "function") updateSummary();
        
    }, 2000); // 2000 = 2 detik animasi muter (waktu loading nya)
}

function displayBooks() {
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    const dataBuku = JSON.parse(localStorage.getItem(KEY_BUKU)) || [];
    const dataPeminjaman = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
    
    tbody.innerHTML = ""; 

    dataBuku.forEach((item, index) => {

        const sedangDipinjam = dataPeminjaman.some(p => p.judul === item.judul && p.status === "Pinjam");
        
        const statusBadge = sedangDipinjam 
            ? `<span class="badge bg-danger">Sedang Dipinjam</span>`
            : `<span class="badge bg-success">Tersedia</span>`;

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.judul}</td>
                <td>${item.penulis}</td>
                <td>${item.tahun}</td>
                <td>${statusBadge}</td> <td>
                    <button onclick="editBook(${index})" class="btn btn-sm btn-primary">Edit</button>
                    <button onclick="deleteBook(${index})" class="btn btn-sm btn-danger">Hapus</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
    });
}

function deleteBook(index) {
    if (confirm("Hapus buku ini?")) {
        let books = JSON.parse(localStorage.getItem(KEY_BUKU)) || [];
        books.splice(index, 1);
        localStorage.setItem(KEY_BUKU, JSON.stringify(books));
        displayBooks();
    }
}

function editBook(index) {
    let books = JSON.parse(localStorage.getItem(KEY_BUKU)) || [];
    const book = books[index];

    document.getElementById("judul").value = book.judul;
    document.getElementById("penulis").value = book.penulis;
    document.getElementById("tahun").value = book.tahun;

    books.splice(index, 1);
    localStorage.setItem(KEY_BUKU, JSON.stringify(books));
    displayBooks();
}

// --- LOGIKA HALAMAN BERANDA (DASHBOARD) ---

function renderDashboard() {
    // Mengambil semua data
    const dataBuku = JSON.parse(localStorage.getItem(KEY_BUKU)) || [];
    const dataPeminjam = JSON.parse(localStorage.getItem(KEY_PEMINJAMAN)) || [];
    const dataAnggota = JSON.parse(localStorage.getItem(KEY_ANGGOTA)) || [];

    // Menghubungkan ke ID HTML 
    const elBuku = document.getElementById("count-buku");
    const elPeminjam = document.getElementById("count-peminjam");
    const elAnggota = document.getElementById("count-anggota");

    // Update angka jika elemen ditemukan
    if (elBuku) elBuku.innerText = dataBuku.length;
    if (elPeminjam) elPeminjam.innerText = dataPeminjam.length;
    if (elAnggota) elAnggota.innerText = dataAnggota.length;
}

window.onload = function() {
    updateSummary();
    renderAktivitas(); // Panggil fungsi aktivitas saat halaman dimuat

    const formBuku = document.getElementById("formBuku");
    if (formBuku) {
        displayBooks();
        formBuku.onsubmit = function(e) {
            e.preventDefault();
            addBook();
        };
    }
};

function updateSummary() {
    const dataBuku = JSON.parse(localStorage.getItem("Daftar_Buku")) || [];
    const dataPeminjam = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
    const dataAnggota = JSON.parse(localStorage.getItem("Daftar_Anggota")) || [];

    if (document.getElementById("count-buku")) document.getElementById("count-buku").innerText = dataBuku.length;
    if (document.getElementById("count-peminjam")) document.getElementById("count-peminjam").innerText = dataPeminjam.length;
    if (document.getElementById("count-anggota")) document.getElementById("count-anggota").innerText = dataAnggota.length;
}

function renderAktivitas() {
    const container = document.getElementById("container-aktivitas");
    if (!container) return;

    // Ambil data peminjaman
    const dataPeminjam = JSON.parse(localStorage.getItem("Daftar_Peminjaman")) || [];
    
    if (dataPeminjam.length === 0) {
        container.innerHTML = '<p class="text-muted">Belum ada aktivitas hari ini.</p>';
        return;
    }

    // Urutkan dari yang terbaru 
    const aktivitasTerbaru = dataPeminjam.reverse().slice(0, 5);

    container.innerHTML = ""; 

    aktivitasTerbaru.forEach(item => {
        const aksi = item.status === "Kembali" ? "Pengembalian" : "Peminjaman";
        const preposisi = item.status === "Kembali" ? "oleh" : "oleh"; 
        
        const html = `
            <div class="row g-2 mb-2">
                <div class="col-md-12">
                    <div class="card-custom1" style="height: auto; padding: 10px;">
                        <p style="margin: 0;">
                            <small style="color: black;">
                                <strong>${aksi}</strong> buku "<strong>${item.judul}</strong>" oleh <strong>${item.nama}</strong> pada ${item.tanggal}
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", html);
    });
}

