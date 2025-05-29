const firebaseConfig = {
  apiKey: "AIzaSyAhHgvDoV_iN5BJE1n3Eiglz371aG8hWV8",
  authDomain: "web-desa-banyusri.firebaseapp.com",
  projectId: "web-desa-banyusri",
  storageBucket: "web-desa-banyusri.appspot.com",
  messagingSenderId: "39340456745",
  appId: "1:39340456745:web:b549c4122a82b8a78fd538"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
