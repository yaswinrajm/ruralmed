// PASTE YOUR FIREBASE CONFIG OBJECT HERE (same as before)
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

const doctorListContainer = document.getElementById('doctor-list-container');
let currentPatientId = null; // We'll store the patient's ID here

// --- NEW: Check user's login state ---
// This is the standard way to get the currently logged-in user
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in.
        console.log("User is logged in:", user.uid);
        currentPatientId = user.uid; // Save the patient's UID
        fetchAndDisplayDoctors(); // Now fetch the doctors
    } else {
        // User is signed out.
        console.log("User is not logged in.");
        // Redirect them to the login page
        window.location.href = '../login/login.html';
    }
});


async function fetchAndDisplayDoctors() {
    doctorListContainer.innerHTML = '<p>Loading doctors...</p>';
    try {
        const doctorsSnapshot = await db.collection('Doctors').get();
        let doctorsHtml = '';

        for (const doc of doctorsSnapshot.docs) {
            const doctorProfile = doc.data();
            const doctorId = doc.id; 

            const userDoc = await db.collection('users').doc(doctorId).get();
            const userData = userDoc.data();

            // --- UPDATED: Added a button with the doctor's ID ---
            doctorsHtml += `
                <div class="doctor-card">
                    <h3>${userData.fullName || userData.name}</h3>
                    <p>Specialization: ${doctorProfile.specialization}</p>
                    <p>Experience: ${doctorProfile.experience} years</p>
                    <p>Availability: ${doctorProfile.availability}</p>
                    <button class="book-btn" data-doctor-id="${doctorId}" data-doctor-name="${userData.fullName || userData.name}">Book Appointment</button>
                </div>
            `;
        }

        doctorListContainer.innerHTML = doctorsHtml;

    } catch (error) {
        console.error("Error fetching doctors: ", error);
        doctorListContainer.innerHTML = '<p>Error loading doctors. Please try again later.</p>';
    }
}

// --- NEW: Function to handle booking ---
async function bookAppointment(doctorId, doctorName) {
    if (!currentPatientId) {
        alert("You must be logged in to book an appointment.");
        return;
    }

    // Create an appointment object
    const appointmentData = {
        patientId: currentPatientId,
        doctorId: doctorId,
        appointmentTime: firebase.firestore.FieldValue.serverTimestamp(), // Use server time
        status: 'pending' // Status is 'pending' until doctor accepts
    };

    try {
        // Add a new document to the 'appointments' collection
        const docRef = await db.collection('appointments').add(appointmentData);
        console.log("Appointment booked with ID: ", docRef.id);
        alert(`Appointment request sent to ${doctorName}!`);
    } catch (error) {
        console.error("Error booking appointment: ", error);
        alert("Failed to book appointment. Please try again.");
    }
}

// --- NEW: Event listener for all "Book Appointment" buttons ---
doctorListContainer.addEventListener('click', (event) => {
    // Check if a book button was clicked
    if (event.target.classList.contains('book-btn')) {
        const doctorId = event.target.dataset.doctorId;
        const doctorName = event.target.dataset.doctorName;
        bookAppointment(doctorId, doctorName);
    }
});