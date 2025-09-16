// DoctorPatientCall.jsx
import React, { useEffect, useRef, useState } from "react";

export default function DoctorPatientCall({ appointmentId, userType, userName }) {
  const jitsiContainer = useRef(null);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    let api = null;

    // Load Jitsi script if not loaded
    const loadJitsi = async () => {
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      const domain = "meet.jit.si";
      const roomName = `telemed_${appointmentId}`;
      const options = {
        roomName,
        width: "100%",
        height: 600,
        parentNode: jitsiContainer.current,
        userInfo: { displayName: `${userType}: ${userName}` },
        configOverwrite: { disableDeepLinking: true },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "chat",
            "hangup",
            "tileview",
          ],
        },
      };

      api = new window.JitsiMeetExternalAPI(domain, options);

      // Set meeting password when doctor joins
      if (userType === "Doctor") {
        api.addListener("videoConferenceJoined", () => {
          api.executeCommand("password", "secure123"); // password lock
        });
      }

      // When call ends
      api.addListener("readyToClose", () => {
        if (userType === "Doctor") {
          setShowNotes(true); // prompt doctor to add notes
        }
      });
    };

    loadJitsi();

    return () => api && api.dispose();
  }, [appointmentId, userType, userName]);

  // Save notes (demo: just logs them)
  const handleSaveNotes = () => {
    console.log("Saved Notes:", notes);
    alert("Consultation notes saved!");
    setShowNotes(false);
    setNotes("");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">
        Video Call – Appointment {appointmentId}
      </h2>
      <div ref={jitsiContainer} style={{ height: "600px", width: "100%" }} />

      {showNotes && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold mb-2">Consultation Notes</h3>
          <textarea
            className="w-full p-2 border rounded"
            rows="4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes or prescription..."
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSaveNotes}
          >
            Save Notes
          </button>
        </div>
      )}
    </div>
  );
}
