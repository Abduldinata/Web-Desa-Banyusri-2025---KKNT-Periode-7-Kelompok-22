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
  });
}

// === Load Profil Desa (untuk halaman publik) ===
function loadProfilDesa() {
  db.collection("profil").doc("desaBanyusri").get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        
        // Safe element updates dengan mapping yang benar
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

        // Visi
        const visiList = document.getElementById("visi-list");
        if (visiList) {
          visiList.innerHTML = "";
          if (data.visi && Array.isArray(data.visi)) {
            data.visi.forEach(item => {
              const li = document.createElement("li");
              li.textContent = item;
              visiList.appendChild(li);
            });
          }
        }

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

// === Load Profil untuk Admin Edit (yang diperbaiki) ===
function loadProfilData() {
  if (!db) {
    console.error('Firestore not initialized');
    return;
  }

  db.collection("profil").doc("desaBanyusri").get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        console.log('Loading profile data:', data);
        
        // Load basic info dengan mapping yang benar sesuai HTML
        setInputValue("nama-desa", data.namaDesa);
        setInputValue("kecamatan", data.kecamatan);
        setInputValue("kabupaten", data.kabupaten);
        setInputValue("provinsi", data.provinsi);
        setInputValue("kode-pos", data.kodePos);
        setInputValue("sejarah-singkat", data.sejarah);
        setInputValue("Visi", data.visi); // Sesuai dengan ID di HTML
        setInputValue("alamat", data.alamat);
        setInputValue("telepon", data.telepon);
        setInputValue("email", data.email);

        // Load dynamic lists
        loadVisiList(data.visi || []);
        loadMisiList(data.misi || []);
        loadPotensiList(data.potensi || []);
        loadStrukturList(data.struktur || []);
        
        showMessage("Data profil berhasil dimuat", "success");
      } else {
        console.log("No profile document found, initializing empty form");
        // Initialize with empty lists
        loadVisiList([]);
        loadMisiList([]);
        loadPotensiList([]);
        loadStrukturList([]);
        showMessage("Tidak ada data profil, silakan isi form", "info");
      }
    })
    .catch(error => {
      console.error("Error loading profile data:", error);
      showMessage("Gagal memuat data profil: " + error.message, "error");
      
      // Initialize empty lists on error
      loadVisiList([]);
      loadMisiList([]);
      loadPotensiList([]);
      loadStrukturList([]);
    });
}

function setInputValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value || "";
  }
}

// Dynamic list functions for Visi
function loadVisiList(visiArray) {
  const list = document.getElementById("visi-list");
  if (!list) return;

  list.innerHTML = "";

  if (!Array.isArray(visiArray) || visiArray.length === 0) {
    addVisiItem();
  } else {
    visiArray.forEach(item => {
      addVisiItem(item);
    });
  }
}

function addVisiItem(value = "") {
  const list = document.getElementById("visi-list");
  if (!list) return;
  
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="text" placeholder="Masukkan visi desa" value="${value}" />
    <button type="button" class="remove-btn" onclick="removeVisiItem(this)">Hapus</button>
  `;
  list.appendChild(li);
}

function removeMisiItem(button) {
  const li = button.parentElement;
  li.remove();
}


// Dynamic list functions for Misi
function loadMisiList(misiArray) {
  const list = document.getElementById("misi-list");
  if (!list) return;
  
  list.innerHTML = "";
  
  if (misiArray.length === 0) {
    addMisiItem();
  } else {
    misiArray.forEach(item => {
      addMisiItem(item);
    });
  }
}

function addMisiItem(value = "") {
  const list = document.getElementById("misi-list");
  if (!list) return;
  
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="text" placeholder="Masukkan misi desa" value="${value}" />
    <button type="button" class="remove-btn" onclick="removeMisiItem(this)">Hapus</button>
  `;
  list.appendChild(li);
}

function removeMisiItem(button) {
  const li = button.parentElement;
  li.remove();
}

// Dynamic list functions for Potensi
function loadPotensiList(potensiArray) {
  const list = document.getElementById("potensi-list");
  if (!list) return;
  
  list.innerHTML = "";
  
  if (potensiArray.length === 0) {
    addPotensiItem();
  } else {
    potensiArray.forEach(item => {
      addPotensiItem(item);
    });
  }
}

function addPotensiItem(value = "") {
  const list = document.getElementById("potensi-list");
  if (!list) return;
  
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="text" placeholder="Masukkan potensi desa" value="${value}" />
    <button type="button" class="remove-btn" onclick="removePotensiItem(this)">Hapus</button>
  `;
  list.appendChild(li);
}

function removePotensiItem(button) {
  const li = button.parentElement;
  li.remove();
}

// Dynamic list functions for Struktur
function loadStrukturList(strukturArray) {
  const list = document.getElementById("struktur-list");
  if (!list) return;
  
  list.innerHTML = "";
  
  if (strukturArray.length === 0) {
    addStrukturItem();
  } else {
    strukturArray.forEach(item => {
      addStrukturItem(item);
    });
  }
}

function addStrukturItem(value = "") {
  const list = document.getElementById("struktur-list");
  if (!list) return;
  
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="text" placeholder="Jabatan - Nama (misal: Kepala Desa - Budi Santoso)" value="${value}" />
    <button type="button" class="remove-btn" onclick="removeStrukturItem(this)">Hapus</button>
  `;
  list.appendChild(li);
}

function removeStrukturItem(button) {
  const li = button.parentElement;
  li.remove();
}

// Untuk mengumpulkan data visi sebelum simpan:
function collectVisiData() {
  const inputs = document.querySelectorAll("#visi-list input");
  return Array.from(inputs).map(input => input.value.trim()).filter(value => value !== "");
}

// Collect data from dynamic lists
function collectMisiData() {
  const inputs = document.querySelectorAll("#misi-list input");
  return Array.from(inputs).map(input => input.value.trim()).filter(value => value !== "");
}

function collectPotensiData() {
  const inputs = document.querySelectorAll("#potensi-list input");
  return Array.from(inputs).map(input => input.value.trim()).filter(value => value !== "");
}

function collectStrukturData() {
  const inputs = document.querySelectorAll("#struktur-list input");
  return Array.from(inputs).map(input => input.value.trim()).filter(value => value !== "");
}

// === Update Profil Desa (Admin) ===
function updateProfilDesa() {
  if (!db) {
    showMessage("Database tidak tersedia", "error");
    return;
  }

  const saveBtn = document.querySelector(".save-btn");
  if (!saveBtn) return;
  
  saveBtn.classList.add("loading");
  saveBtn.textContent = "Menyimpan...";
  saveBtn.disabled = true;

  const profilData = {
    namaDesa: document.getElementById("nama-desa").value.trim(),
    kecamatan: document.getElementById("kecamatan").value.trim(),
    kabupaten: document.getElementById("kabupaten").value.trim(),
    provinsi: document.getElementById("provinsi").value.trim(),
    kodePos: document.getElementById("kode-pos").value.trim(),
    sejarah: document.getElementById("sejarah-singkat").value.trim(),
    visi: collectVisiData(), // Sesuai dengan ID di HTML
    misi: collectMisiData(),
    potensi: collectPotensiData(),
    struktur: collectStrukturData(),
    alamat: document.getElementById("alamat").value.trim(),
    telepon: document.getElementById("telepon").value.trim(),
    email: document.getElementById("email").value.trim(),
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Validate required fields
  if (!profilData.namaDesa || !profilData.kecamatan || !profilData.kabupaten || !profilData.provinsi) {
    showMessage("Mohon lengkapi data umum desa (Nama Desa, Kecamatan, Kabupaten, Provinsi)", "error");
    resetSaveButton();
    return;
  }

  // Save to Firestore
  db.collection("profil").doc("desaBanyusri").set(profilData)
    .then(() => {
      console.log("Profile data saved successfully");
      showMessage("Profil desa berhasil disimpan!", "success");
      resetSaveButton();
    })
    .catch(error => {
      console.error("Error saving profile:", error);
      showMessage("Gagal menyimpan profil desa: " + error.message, "error");
      resetSaveButton();
    });
}

function resetSaveButton() {
  const saveBtn = document.querySelector(".save-btn");
  if (saveBtn) {
    saveBtn.classList.remove("loading");
    saveBtn.textContent = "Simpan Perubahan";
    saveBtn.disabled = false;
  }
}

// Show message function
function showMessage(message, type) {
  const container = document.getElementById("message-container");
  if (!container) return;
  
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  
  // Add some basic styling
  messageDiv.style.padding = "10px";
  messageDiv.style.margin = "10px 0";
  messageDiv.style.borderRadius = "5px";
  messageDiv.style.border = "1px solid";
  
  if (type === "success") {
    messageDiv.style.backgroundColor = "#d4edda";
    messageDiv.style.color = "#155724";
    messageDiv.style.borderColor = "#c3e6cb";
  } else if (type === "error") {
    messageDiv.style.backgroundColor = "#f8d7da";
    messageDiv.style.color = "#721c24";
    messageDiv.style.borderColor = "#f5c6cb";
  } else if (type === "info") {
    messageDiv.style.backgroundColor = "#d1ecf1";
    messageDiv.style.color = "#0c5460";
    messageDiv.style.borderColor = "#bee5eb";
  }
  
  container.innerHTML = "";
  container.appendChild(messageDiv);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (container.contains(messageDiv)) {
      container.removeChild(messageDiv);
    }
  }, 5000);
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
      email: user.email,
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
      if (typeof loadProfilDesa === 'function' && document.getElementById("nama-desa") && !path.includes("admin")) {
        loadProfilDesa();
      }
      if (typeof loadProfilData === 'function' && path.includes("profil-admin")) {
        loadProfilData();
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
});

// Error handler global
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