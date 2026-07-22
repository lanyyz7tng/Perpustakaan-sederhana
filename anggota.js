// Menjalankan fungsi saat halaman selesai dimuat
window.onload = function() {
    displayAnggota();

   
    const formAnggota = document.getElementById("formAnggota"); 
    if (formAnggota) {
        formAnggota.onsubmit = function(e) {
            e.preventDefault(); 
            addAnggota();
        };
    }
};

// Fungsi Utama Tambah Anggota
function addAnggota() {
    const namaInput = document.getElementById("nama_anggota");
    const alamatInput = document.getElementById("alamat"); // Diperbaiki agar konsisten
    const emailInput = document.getElementById("email");
    const tanggalInput = document.getElementById("tanggal_bergabung");

    // Validasi: Gunakan nama variabel yang benar
    if (!namaInput.value || !alamatInput.value || !emailInput.value || !tanggalInput.value) {
        Swal.fire("Peringatan", "Mohon lengkapi semua data anggota!", "warning");
        return;
    }

    Swal.fire({
        title: "Pendaftaran Anggota",
        text: "Sedang memproses data...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    setTimeout(() => {
        const anggotaBaru = {
            nama: namaInput.value,
            alamat: alamatInput.value, 
            email: emailInput.value,
            tanggal: tanggalInput.value
        };

        let listAnggota = JSON.parse(localStorage.getItem("Daftar_Anggota")) || [];
        listAnggota.push(anggotaBaru);
        localStorage.setItem("Daftar_Anggota", JSON.stringify(listAnggota));

        Swal.fire({
            icon: "success",
            title: "Pendaftaran Berhasil!",
            text: `${anggotaBaru.nama} telah resmi menjadi anggota.`,
            timer: 2000,
            showConfirmButton: false
        });

        displayAnggota();
        document.getElementById("formAnggota").reset(); 
        
        if (typeof updateSummary === "function") updateSummary();

    }, 1500);
}

function displayAnggota() {
    const tabelBody = document.getElementById("tabelBuku");
    if (!tabelBody) return;

    const listAnggota = JSON.parse(localStorage.getItem("Daftar_Anggota")) || [];
    tabelBody.innerHTML = ""; 

    listAnggota.forEach((anggota, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${anggota.nama}</td>
                <td>${anggota.alamat}</td>
                <td>${anggota.email}</td>
                <td>${anggota.tanggal}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editAnggota(${index})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAnggota(${index})">Hapus</button>
                </td>
            </tr>`;
        tabelBody.insertAdjacentHTML("beforeend", row);
    });
}

function deleteAnggota(index) {
    Swal.fire({
        title: "Hapus Anggota?",
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            let listAnggota = JSON.parse(localStorage.getItem("Daftar_Anggota")) || [];
            listAnggota.splice(index, 1);
            localStorage.setItem("Daftar_Anggota", JSON.stringify(listAnggota));
            displayAnggota();
            
            Swal.fire("Dihapus!", "Data anggota telah dihapus.", "success");
            if (typeof updateSummary === "function") updateSummary();
        }
    });
}


// Fungsi Edit Anggota
function editAnggota(index) {
    let listAnggota = JSON.parse(localStorage.getItem("Daftar_Anggota")) || [];
    const anggota = listAnggota[index];

    document.getElementById("nama_anggota").value = anggota.nama;
    document.getElementById("alamat").value = anggota.alamat;
    document.getElementById("email").value = anggota.email;
    document.getElementById("tanggal_bergabung").value = anggota.tanggal;

    listAnggota.splice(index, 1);
    localStorage.setItem("Daftar_Anggota", JSON.stringify(listAnggota));
    displayAnggota();
    
    Swal.fire({
        icon: "info",
        title: "Mode Edit",
        text: "Data dimuat ke form. Silakan ubah dan klik Tambah kembali.",
    });
}