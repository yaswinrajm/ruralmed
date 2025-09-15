// PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
    apiKey: "AIzaSyCaJYPNxUXLIAjXGJVS4R9hvLeXNXj7yjg",
    authDomain: "ruralmed-d1d48.firebaseapp.com",
    projectId: "ruralmed-d1d48",
    storageBucket: "ruralmed-d1d48.firebasestorage.app",
    messagingSenderId: "246871415824",
    appId: "8991:246871415824:web:a16171bfb399653ee2fe95"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginButton = document.getElementById('loginButton');
const messageEl = document.getElementById('message');

loginButton.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    messageEl.textContent = 'Logging in...';

    auth.signInWithEmailAndPassword(email, password)
        .then(async (userCredential) => { // Make this function async
            const user = userCredential.user;
            console.log('User logged in:', user.uid);

            // --- NEW: Check the user's role from Firestore ---
            const userDocRef = db.collection('users').doc(user.uid);
            const userDoc = await userDocRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                messageEl.textContent = 'Login Successful! Redirecting...';

                // --- Redirect based on role ---
                if (userData.role === 'doctor') {
                    window.location.href = '../doctor_dashboard/doctor_dashboard.html';
                } else {
                    window.location.href = '../dashboard/dashboard.html';
                }
            } else {
                // This case is unlikely but good to handle
                throw new Error("User data not found in database.");
            }
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error('Login Error:', errorMessage);
            messageEl.textContent = `Error: ${errorMessage}`;
        });
});