// DoctorPatientCall.jsx
// Firebase config (replace with your own project settings)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const requestsContainer = document.getElementById("requests-container");
const startCallBtn = document.getElementById("startCallBtn");

// Load pending appointment requests
async function loadRequests() {
    const snapshot = await db.collection("appointments")
                             .where("status", "==", "pending")
                             .get();
    requestsContainer.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();
        const card = document.createElement("div");
        card.classList.add("request-card");
        card.innerHTML = `
            <h3>${data.patientName}</h3>
            <p>Reason: ${data.reason}</p>
            <p>Status: ${data.status}</p>
        `;
        requestsContainer.appendChild(card);
    });
}

loadRequests();

// Jitsi Meet integration
let api = null;

function startMeeting(roomName, userName) {
    if (api) {
        api.dispose();
    }
    const domain = "meet.jit.si";
    const options = {
        roomName: roomName,
        width: "100%",
        height: 500,
        parentNode: document.getElementById("jitsiContainer"),
        userInfo: {
            displayName: userName,
        },
    };
    api = new JitsiMeetExternalAPI(domain, options);
}

// When doctor clicks "Start Call"
startCallBtn.addEventListener("click", async () => {
    const roomName = "ruralmed_" + Date.now(); // unique ID
    const doctorName = "Dr. " + (localStorage.getItem("doctorName") || "Anonymous");

    // Save room info in Firestore so patient can join
    await db.collection("currentCalls").doc("activeRoom").set({
        room: roomName,
        startedAt: new Date(),
    });

    startMeeting(roomName, doctorName);
});
