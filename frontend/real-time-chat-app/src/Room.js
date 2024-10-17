import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { useState, useEffect } from "react";

export default function Room() {
  const { roomName } = useParams();
  const { userName } = useUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // If there is no username, if the user is not signed in, redirect to homepage
  useEffect(() => {
    if (!userName) {
      navigate("/");
    }
  }, [userName, navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/messages/${roomName}`
        );
        const data = await response.json();
        if (isMounted && data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [roomName]);

  const handleSendMessage = async () => {
    try {
      const response = await fetch("http://localhost:5000/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName, userName, message }),
      });

      const data = await response.json();
      if (data.success) {
        const newMessage = {
          user: userName,
          message,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage("");
      } else {
        alert("Failed sending message. Try again later.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="text-center mt-4 mx-2">
        <h1 className="text-2xl font-bold">
          Welcome to <span className="text-4xl">{roomName}</span> chat room{" "}
          <span className="text-4xl">{userName}</span>
        </h1>
        <p className="text-sm italic">Start typing and talking with people!</p>
        <hr />
      </div>

      <div className="h-full w-6/12 m-auto block pt-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              message.user === userName ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`${
                message.user === userName
                  ? "bg-blue-400 text-white"
                  : "bg-gray-100 text-black"
              } p-2.5 rounded-lg max-w-[320px]`}
            >
              <span className="font-bold">{message.user}</span>
              <span className="ml-4 text-xs text-gray-600">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
              <div className="mt-1">{message.message}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 mx-2 text-center">
        <input
          placeholder="Enter your message here"
          className="border border-gray-600 py-1 px-2 rounded-md"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="ml-4 bg-blue-400 text-gray-100 text-sm py-1 px-2 rounded hover:bg-blue-600"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
