// Untuk Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        return db.collection("users").doc(cred.user.uid).set({
          nama: nama,
          email: email,
          role: "user"
        });
      })
      .then(() => {
        alert("Pendaftaran berhasil! Silakan login.");
        registerForm.reset();
        window.location.href = "login.html"; // langsung arahkan ke login
      })
      .catch((err) => {
        alert("Error: " + err.message);
      });
  });
}

// Untuk Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
      .then((cred) => {
        return db.collection("users").doc(cred.user.uid).get();
      })
      .then((doc) => {
        if (doc.exists) {
          const role = doc.data().role;
          alert("Login berhasil! Selamat datang, " + doc.data().nama);

          if (role === "admin") {
            window.location.href = "../html/dashboard-admin.html";
          } else if (role === "user") {
            window.location.href = "../html/dashboard.html";
          } else {
            alert("Role pengguna tidak dikenali.");
          }
        } else {
          alert("Akun tidak ditemukan dalam database.");
        }
      })
      .catch((err) => {
        alert("Login gagal: " + err.message);
      });
  });
}
