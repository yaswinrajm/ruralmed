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

const requestsContainer = document.getElementById('requests-container');

// Check who is logged in
auth.onAuthStateChanged(user => {
    if (user) {
        // Ensure the user is a doctor before fetching data
        checkUserRoleAndFetchAppointments(user.uid);
    } else {
        window.location.href = '../login/login.html';
    }
});

async function checkUserRoleAndFetchAppointments(uid) {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists && userDoc.data().role === 'doctor') {
        fetchAppointments(uid);
    } else {
        // If a patient somehow gets here, send them away
        alert("Access denied. This page is for doctors only.");
        window.location.href = '../dashboard/dashboard.html';
    }
}

async function fetchAppointments(doctorId) {
    requestsContainer.innerHTML = '<p>Loading requests...</p>';
    
    // Query for appointments assigned to this doctor that are 'pending'
    const appointmentsRef = db.collection('appointments');
    const query = appointmentsRef.where('doctorId', '==', doctorId).where('status', '==', 'pending');

    query.onSnapshot(async (querySnapshot) => { // Use onSnapshot for real-time updates
        if (querySnapshot.empty) {
            requestsContainer.innerHTML = '<p>No pending appointment requests.</p>';
            return;
        }

        let requestsHtml = '';
        for (const doc of querySnapshot.docs) {
            const appointment = doc.data();
            const appointmentId = doc.id;

            // Get the patient's name
            const patientDoc = await db.collection('users').doc(appointment.patientId).get();
            const patientName = patientDoc.exists ? patientDoc.data().fullName : 'Unknown Patient';

            requestsHtml += `
                <div class="request-card" id="request-${appointmentId}">
                    <h3>Request from: ${patientName}</h3>
                    <p>Time of Request: ${new Date(appointment.appointmentTime.seconds * 1000).toLocaleString()}</p>
                    <button class="accept-btn" data-id="${appointmentId}">Accept</button>
                </div>
            `;
        }
        requestsContainer.innerHTML = requestsHtml;
    });
}

// Event listener for the "Accept" buttons
requestsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('accept-btn')) {
        const appointmentId = event.target.dataset.id;
        
        // Update the appointment status to 'confirmed'
        const appointmentRef = db.collection('appointments').doc(appointmentId);
        appointmentRef.update({
            status: 'confirmed'
        })
        .then(() => {
            console.log("Appointment confirmed!");
            // The real-time listener will automatically remove the card from the UI
        })
        .catch(error => {
            console.error("Error confirming appointment: ", error);
        });
    }
});