import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface Message {
  from: string;
  text: string;
}

interface ChatBoxProps {
  socket: Socket;
  currentUserId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ socket, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMessage = ({ from, text }: Message) => {
      setMessages((prev) => [...prev, { from, text }]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        height: "300px",
        overflowY: "auto",
        background: "#f9f9f9",
        minWidth: "500px",
      }}
    >
      {messages.map((msg, index) => {
        const isMe = msg.from === currentUserId;
        return (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isMe ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "#888" }}>
              {isMe ? "You" : msg.from}
            </span>
            <div
              style={{
                backgroundColor: isMe ? "#daf1d8" : "#e0e0e0",
                padding: "8px 12px",
                borderRadius: "16px",
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBox;
