// PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_KEY",
  authDomain: "sih-ruralmed-2025.firebaseapp.com",
  projectId: "sih-ruralmed-2025",
  storageBucket: "sih-ruralmed-2025.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Get elements from the HTML
const registerButton = document.getElementById('registerButton');
const messageEl = document.getElementById('message');

// Add a click event listener to the button
registerButton.addEventListener('click', () => {
    // Get user inputs
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    messageEl.textContent = 'Registering...';

    // --- Firebase Magic Happens Here ---
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User is successfully created in Firebase Authentication
            const user = userCredential.user;
            console.log('User created:', user);

            // NOW, we add the user's details to the Firestore database
            return db.collection('users').doc(user.uid).set({
                fullName: fullName,
                email: email,
                role: 'patient' // All new signups are patients by default
            });
        })
        .then(() => {
            // This block runs after the user data is saved to Firestore
            messageEl.textContent = 'Registration Successful! You can now log in.';
            console.log('User data saved to Firestore.');
            // You can redirect to a login page here if you want
            // window.location.href = 'login.html'; 
        })
        .catch((error) => {
            // Handle errors
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error:', errorCode, errorMessage);
            messageEl.textContent = `Error: ${errorMessage}`;
        });
});
