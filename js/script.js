// Validasi Email yang lebih ketat
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

// Validasi Password yang lebih komprehensif
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Minimal 6 karakter
  if (password.length < 6) {
    return false;
  }
  
  // Opsional: tambahkan validasi lain
  // - Minimal 1 huruf besar
  // - Minimal 1 angka
  // - Minimal 1 karakter khusus
  
  return true;
}

// Validasi Password yang lebih ketat (opsional)
function validateStrongPassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Minimal 8 karakter
  if (password.length < 8) {
    return false;
  }
  
  // Harus ada huruf kecil
  if (!/[a-z]/.test(password)) {
    return false;
  }
  
  // Harus ada huruf besar
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Harus ada angka
  if (!/\d/.test(password)) {
    return false;
  }
  
  // Harus ada karakter khusus
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }
  
  return true;
}

// Validasi nama (untuk form register)
function validateName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmedName = name.trim();
  
  // Minimal 2 karakter, maksimal 50
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return false;
  }
  
  // Hanya huruf dan spasi
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(trimmedName);
}
// === Global Variables ===
let logoutTimer;

// === Untuk Register ===
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Validasi menggunakan function
    if (!validateName(nama)) {
      alert("Nama harus berisi 2-50 karakter, hanya huruf dan spasi!");
      return;
    }

    if (!validateEmail(email)) {
      alert("Format email tidak valid!");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password minimal 6 karakter!");
      return;
    }

    // Lanjut ke proses registration Firebase
    auth.createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        // Register berhasil
      })
      .catch((err) => {
        alert("Error: " + err.message);
      });
  });
}

// === Untuk Login ===
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Validasi menggunakan function
    if (!validateEmail(email)) {
      alert("Format email tidak valid!");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password minimal 6 karakter!");
      return;
    }

    // Lanjut ke proses authentication Firebase
auth.signInWithEmailAndPassword(email, password)
  .then((cred) => {
    // Ambil data user dari Firestore
    db.collection("users").doc(cred.user.uid).get().then(doc => {
      if (doc.exists) {
        const role = doc.data().role;
        if (role === "admin") {
          window.location.href = "dashboard-admin.html";
        } else if (role === "user") {
          window.location.href = "dashboard.html";
        } else {
          alert("Role tidak dikenali.");
        }
      } else {
        alert("Data user tidak ditemukan.");
      }
    }).catch(err => {
      alert("Gagal mengambil data user: " + err.message);
    });
  })
  .catch((err) => {
    alert("Login gagal: " + err.message);
  });
}); // <--- Tambahkan ini untuk menutup event listener
}   

// === Load Profil Desa ===
function loadProfilDesa() {
  db.collection("profil").doc("desaBanyusri").get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        
        // Safe element updates
        const elements = {
          "nama-desa": data.namaDesa || "",
          "kecamatan": data.kecamatan || "",
          "kabupaten": data.kabupaten || "",
          "provinsi": data.provinsi || "",
          "kode-pos": data.kodePos || "",
          "sejarah-singkat": data.sejarah || "",
          "visi": data.visi || "",
          "alamat": data.alamat || "",
          "telepon": data.telepon || "",
          "email": data.email || ""
        };

        Object.keys(elements).forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.textContent = elements[id];
          }
        });

        // Misi
        const misiList = document.getElementById("misi-list");
        if (misiList) {
          misiList.innerHTML = "";
          if (data.misi && Array.isArray(data.misi)) {
            data.misi.forEach(item => {
              const li = document.createElement("li");
              li.textContent = item;
              misiList.appendChild(li);
            });
          }
        }

        // Potensi
        const potensiList = document.getElementById("potensi-list");
        if (potensiList) {
          potensiList.innerHTML = "";
          if (data.potensi && Array.isArray(data.potensi)) {
            data.potensi.forEach(item => {
              const li = document.createElement("li");
              li.textContent = item;
              potensiList.appendChild(li);
            });
          }
        }

        // Struktur
        const strukturList = document.getElementById("struktur-list");
        if (strukturList) {
          strukturList.innerHTML = "";
          if (data.struktur && Array.isArray(data.struktur)) {
            data.struktur.forEach(item => {
              const li = document.createElement("li");
              li.textContent = item;
              strukturList.appendChild(li);
            });
          }
        }
      } else {
        console.warn("Dokumen profil desa tidak ditemukan.");
      }
    })
    .catch(err => console.error("Gagal memuat data profil: ", err));
}

// === Update Profil Desa (Admin) ===
function updateProfilDesa() {
  const data = {
    namaDesa: document.getElementById("nama-desa")?.value || "",
    kecamatan: document.getElementById("kecamatan")?.value || "",
    kabupaten: document.getElementById("kabupaten")?.value || "",
    provinsi: document.getElementById("provinsi")?.value || "",
    kodePos: document.getElementById("kode-pos")?.value || "",
    sejarah: document.getElementById("sejarah-singkat")?.value || "",
    visi: document.getElementById("visi")?.value || "",
    misi: Array.from(document.querySelectorAll("#misi-list input")).map(input => input.value).filter(val => val.trim()),
    potensi: Array.from(document.querySelectorAll("#potensi-list input")).map(input => input.value).filter(val => val.trim()),
    struktur: Array.from(document.querySelectorAll("#struktur-list input")).map(input => input.value).filter(val => val.trim()),
    alamat: document.getElementById("alamat")?.value || "",
    telepon: document.getElementById("telepon")?.value || "",
    email: document.getElementById("email")?.value || "",
  };

  db.collection("profil").doc("desaBanyusri").update(data)
    .then(() => alert("Profil berhasil diperbarui!"))
    .catch(err => alert("Gagal update: " + err.message));
}

// === Pengumuman (Admin) ===
const pengumumanForm = document.getElementById("form-pengumuman");
if (pengumumanForm) {
  pengumumanForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const judul = document.getElementById("judul").value;
    const isi = document.getElementById("isi").value;

    if (!judul || !isi) {
      alert("Judul dan isi pengumuman harus diisi!");
      return;
    }

    db.collection("pengumuman").add({
      judul: judul,
      isi: isi,
      timestamp: new Date()
    }).then(() => {
      alert("Pengumuman berhasil diposting.");
      pengumumanForm.reset();
    }).catch(err => {
      alert("Gagal: " + err.message);
    });
  });
}

// === Pengaduan Management (Admin) ===
function loadPengaduan() {
  const tableBody = document.getElementById("pengaduan-table-body");
  if (!tableBody) return;

  db.collection("pengaduan").orderBy("timestamp", "desc").get().then(snapshot => {
    tableBody.innerHTML = "";
    if (snapshot.empty) {
      tableBody.innerHTML = '<tr><td colspan="4">Tidak ada pengaduan.</td></tr>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement("tr");
      const timestamp = data.timestamp ? data.timestamp.toDate().toLocaleString('id-ID') : 'Tidak diketahui';
      
      row.innerHTML = `
        <td>${data.nama || 'Anonim'}</td>
        <td>${data.isi || ''}</td>
        <td><span class="status-${data.status}">${data.status || 'belum dibaca'}</span></td>
        <td>${timestamp}</td>
        <td>
          <button onclick="ubahStatus('${doc.id}')" class="btn-status">Ubah Status</button>
          <button onclick="hapusPengaduan('${doc.id}')" class="btn-hapus">Hapus</button>
        </td>`;
      tableBody.appendChild(row);
    });
  }).catch(err => {
    tableBody.innerHTML = `<tr><td colspan="5">Gagal memuat data: ${err.message}</td></tr>`;
  });
}

function ubahStatus(id) {
  const newStatus = prompt("Masukkan status baru:\n- belum dibaca\n- diproses\n- selesai");
  if (newStatus && ['belum dibaca', 'diproses', 'selesai'].includes(newStatus)) {
    db.collection("pengaduan").doc(id).update({ status: newStatus })
      .then(() => {
        alert("Status berhasil diubah!");
        loadPengaduan();
      })
      .catch(err => alert("Gagal update: " + err.message));
  } else if (newStatus) {
    alert("Status tidak valid! Gunakan: belum dibaca, diproses, atau selesai");
  }
}

function hapusPengaduan(id) {
  if (confirm("Yakin ingin menghapus pengaduan ini?")) {
    db.collection("pengaduan").doc(id).delete()
      .then(() => {
        alert("Pengaduan berhasil dihapus!");
        loadPengaduan();
      })
      .catch(err => alert("Gagal hapus: " + err.message));
  }
}

// === Layanan Management (Admin) ===
function loadLayanan() {
  const tableBody = document.getElementById("layanan-table-body");
  if (!tableBody) return;

  db.collection("layanan").get().then(snapshot => {
    tableBody.innerHTML = "";
    if (snapshot.empty) {
      tableBody.innerHTML = '<tr><td colspan="3">Tidak ada layanan.</td></tr>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.nama || ''}</td>
        <td>${data.deskripsi || ''}</td>
        <td>
          <button onclick="hapusLayanan('${doc.id}')" class="btn-hapus">Hapus</button>
        </td>`;
      tableBody.appendChild(row);
    });
  }).catch(err => {
    tableBody.innerHTML = `<tr><td colspan="3">Gagal memuat data: ${err.message}</td></tr>`;
  });
}

function tambahLayanan() {
  const nama = prompt("Nama layanan baru:");
  const deskripsi = prompt("Deskripsi layanan:");
  if (nama && deskripsi) {
    db.collection("layanan").add({ nama: nama.trim(), deskripsi: deskripsi.trim() })
      .then(() => {
        alert("Layanan berhasil ditambahkan!");
        loadLayanan();
      })
      .catch(err => alert("Gagal tambah: " + err.message));
  }
}

function hapusLayanan(id) {
  if (confirm("Yakin ingin menghapus layanan ini?")) {
    db.collection("layanan").doc(id).delete()
      .then(() => {
        alert("Layanan berhasil dihapus!");
        loadLayanan();
      })
      .catch(err => alert("Gagal hapus: " + err.message));
  }
}

// === Pengaduan (User) ===
const pengaduanForm = document.getElementById("form-pengaduan");
if (pengaduanForm) {
  pengaduanForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const nama = document.getElementById("nama").value;
    const isi = document.getElementById("isi").value;

    if (!nama || !isi) {
      alert("Nama dan isi pengaduan harus diisi!");
      return;
    }

    const statusElement = document.getElementById("status");
    const user = firebase.auth().currentUser;

    if (!user) {
      alert("Anda harus login untuk mengirim pengaduan.");
      return;
    }

    db.collection("pengaduan").add({
      nama: nama.trim(),
      email: user.email, // <-- TAMBAHKAN INI!
      isi: isi.trim(),
      timestamp: new Date(),
      status: "belum dibaca"
    }).then(() => {
      if (statusElement) {
        statusElement.textContent = "Pengaduan berhasil dikirim!";
        statusElement.style.color = "green";
      } else {
        alert("Pengaduan berhasil dikirim!");
      }
      pengaduanForm.reset();
      loadRiwayat(nama.trim());
    }).catch(err => {
      if (statusElement) {
        statusElement.textContent = "Gagal: " + err.message;
        statusElement.style.color = "red";
      } else {
        alert("Gagal kirim: " + err.message);
      }
    });
  });
}

// === Load Riwayat Pengaduan User ===
function loadRiwayat(nama) {
  const riwayatList = document.getElementById("riwayat-list");
  if (!riwayatList || !nama) return;

  db.collection("pengaduan").where("nama", "==", nama).orderBy("timestamp", "desc").get()
    .then(snapshot => {
      if (snapshot.empty) {
        riwayatList.innerHTML = "<p>Belum ada pengaduan.</p>";
        return;
      }

      let html = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const waktu = data.timestamp ? data.timestamp.toDate().toLocaleString('id-ID') : 'Tidak diketahui';
        html += `
          <div class="pengaduan-item">
            <p><strong>Isi:</strong> ${data.isi || ''}</p>
            <p><strong>Status:</strong> <span class="status status-${data.status}">${data.status || 'belum dibaca'}</span></p>
            <p><small><em>Dikirim pada: ${waktu}</em></small></p>
          </div>
        `;
      });

      riwayatList.innerHTML = html;
    })
    .catch(err => {
      riwayatList.innerHTML = "<p>Gagal memuat riwayat: " + err.message + "</p>";
    });
}

// === Auto-load riwayat when nama field loses focus ===
const namaField = document.getElementById("nama");
if (namaField) {
  namaField.addEventListener("blur", function () {
    const nama = this.value.trim();
    if (nama) loadRiwayat(nama);
  });
}

// === Load Profil for Admin Edit ===
function loadProfil() {
  db.collection("profil").doc("desaBanyusri").get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        
        const fields = [
          'nama-desa', 'kecamatan', 'kabupaten', 'provinsi', 
          'kode-pos', 'sejarah-singkat', 'visi', 'alamat', 'telepon', 'email'
        ];
        
        fields.forEach(fieldId => {
          const element = document.getElementById(fieldId);
          if (element) {
            const dataKey = fieldId.replace('-', '');
            element.value = data[dataKey] || data[fieldId.replace('-', '')] || '';
          }
        });
      }
    })
    .catch(err => console.error("Gagal memuat profil: ", err));
}

// === Auto Logout Timer ===
function startLogoutTimer() {
  resetLogoutTimer();
}

function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    auth.signOut().then(() => {
      alert("Sesi habis. Anda akan logout otomatis.");
      window.location.href = "login.html";
    });
  }, 30 * 60 * 1000); // 30 menit
}

// === Authentication State Management ===
auth.onAuthStateChanged((user) => {
  const path = window.location.pathname;
  const halamanDilindungi = path.includes("admin") || path.includes("user") || path.includes("dashboard") || path.includes("dashboard-admin") || path.includes("layanan") || path.includes("layanan-admin")|| path.includes("pengaduan") || path.includes("pengaduan-admin") || path.includes("pengumuman") || path.includes("[pengumuman-admin]") || path.includes("profil") || path.includes("profil-admin") || path.includes("warga-admin") ;
  if (user) {
    console.log("User terdeteksi: ", user.email);

    // Ambil token JWT (opsional untuk debug/backend)
    user.getIdToken().then(token => {
      console.log("JWT Token:", token);
    }).catch(err => console.error("Error getting token:", err));

    db.collection("users").doc(user.uid).get().then(doc => {
      if (!doc.exists) {
        alert("Data pengguna tidak ditemukan.");
        auth.signOut();
        return;
      }

      const data = doc.data();
      const role = data.role;

      // Proteksi role terhadap URL
      if (path.includes("admin") && role !== "admin") {
        alert("Akses ditolak: Anda bukan admin.");
        window.location.href = "login.html";
        return;
      }

      if (path.includes("dashboard.html") && role !== "user") {
        alert("Akses ditolak: Anda bukan user.");
        window.location.href = "login.html";
        return;
      }

      // Aktifkan auto logout
      startLogoutTimer();
      window.addEventListener("mousemove", resetLogoutTimer);
      window.addEventListener("keydown", resetLogoutTimer);
      window.addEventListener("click", resetLogoutTimer);

      // Load data sesuai halaman
      if (typeof loadProfilDesa === 'function' && document.getElementById("nama-desa")) {
        loadProfilDesa();
      }
      if (typeof loadProfil === 'function' && path.includes("admin") && document.getElementById("nama-desa")) {
        loadProfil();
      }
      if (typeof loadPengaduan === 'function' && document.getElementById("pengaduan-table-body")) {
        loadPengaduan();
      }
      if (typeof loadLayanan === 'function' && document.getElementById("layanan-table-body")) {
        loadLayanan();
      }
      
    }).catch(err => {
      console.error("Gagal mengambil data pengguna:", err);
      auth.signOut();
      window.location.href = "login.html";
    });
  } else if (halamanDilindungi) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "login.html";
  }
});

// === Logout with Confirmation ===
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const konfirmasi = confirm("Yakin ingin keluar dari akun Anda?");
    if (konfirmasi) {
      logoutBtn.textContent = "Keluar...";
      logoutBtn.style.opacity = "0.6";
      logoutBtn.style.pointerEvents = "none";

      auth.signOut()
        .then(() => {
          alert("Logout berhasil!");
          window.location.href = "login.html";
        })
        .catch((err) => {
          alert("Gagal logout: " + err.message);
          logoutBtn.textContent = "Keluar";
          logoutBtn.style.opacity = "1";
          logoutBtn.style.pointerEvents = "auto";
        });
    }
  });
}

// === Initialize functions when DOM is loaded ===
document.addEventListener('DOMContentLoaded', function() {
  // Auto-load functions based on current page elements
  if (document.getElementById("pengaduan-table-body")) {
    loadPengaduan();
  }
  if (document.getElementById("layanan-table-body")) {
    loadLayanan();
  }
});// Error handler global
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  alert('Terjadi kesalahan sistem. Silakan coba lagi.');
});

// Connection check
function checkFirebaseConnection() {
  return db.collection("test").get()
    .then(() => {
      console.log("Firebase connection OK");
      return true;
    })
    .catch(err => {
      console.error("Firebase connection failed:", err);
      alert("Koneksi ke database gagal. Periksa internet Anda.");
      return false;
    });
}

//Loading States
function showLoading(element) {
  if (element) {
    element.innerHTML = '<div class="loading">Memuat...</div>';
  }
}

function hideLoading(element, originalContent) {
  if (element) {
    element.innerHTML = originalContent;
  }
}