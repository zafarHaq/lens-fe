import { useEffect, useState } from "react";
import socket from "./socket";
import ChatBox from "./ChatBox";

function App() {
  const [qr, setQr] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [statusMessage, setStatusMssage] = useState("");

  useEffect(() => {
    console.log("🚀 Connecting socket...");
    // Check if already connected before starting a new session
    if (!socket.connected) {
      socket.emit("start-session", {
        sessionId: "4e66d0b8-4f4f-4a62-9a09-59688cfaf450",
      });
    }

    socket.on("qr", ({ qr }) => {
      console.log("📸 Received QR:", qr);
      setQr(qr);
    });

    socket.on("ready", () => {
      console.log("✅ WhatsApp client is ready!");
      setQr(null);
      setConnected(true);
    });

    socket.on("message", ({ from, text }) => {
      console.log("📩 New message from", from, ":", text);
      setMessages((prev) => [...prev, { from, text }]);
    });

    socket.on("status", ({ state, message }) => {
      setStatus(state);
      setStatusMssage(message);
    });

    return () => {
      socket.off("qr");
      socket.off("ready");
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (!to || !input) {
      alert("Please provide both recipient and message");
      return;
    }

    const jid = to.includes("@") ? to : `${to}@s.whatsapp.net`;

    console.log("📤 Sending message to", jid, ":", input);

    socket.emit("send-message", {
      sessionId: "4e66d0b8-4f4f-4a62-9a09-59688cfaf450",
      to: jid,
      message: input,
    });

    setInput("");
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
        display: "flex",
        gap: 200,
        margin: "50px",
      }}
    >
      <div>
        <h2>Frontend Loaded</h2>
        <p>
          <strong>QR:</strong> {qr ? "Available ✅" : "Not Available ❌"}
        </p>
        <p>
          <strong>Connected:</strong> {connected ? "Yes ✅" : "No ❌"}
        </p>
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Status Message:</strong> {statusMessage}
        </p>

        {!connected && qr && (
          <div>
            <h3>Scan QR to Login</h3>
            <img src={qr} alt="QR Code" />
          </div>
        )}

        {connected && (
          <div>
            <h2>Send WhatsApp Message</h2>

            <input
              type="text"
              placeholder="Enter recipient JID or phone (e.g. 919876543210)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ marginBottom: 10, width: 300 }}
            />
            <br />
            <input
              type="text"
              placeholder="Type your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ marginBottom: 10, width: 300 }}
            />
            <br />
            <button onClick={sendMessage}>Send</button>

            <div style={{ marginTop: 30 }}>
              <h3>Incoming Messages</h3>
              {messages.map((m, i) => (
                <p key={i}>
                  <strong>{m.from}:</strong> {m.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
      <ChatBox
        socket={socket}
        currentUserId="4e66d0b8-4f4f-4a62-9a09-59688cfaf450"
      />
    </div>
  );
}

export default App;
