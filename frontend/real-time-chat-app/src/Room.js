import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Room() {
  const { roomName } = useParams();
  const { userName } = useUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messageEndRef = useRef(null);

  // Scroll to bottom to see the newest messages
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If there is no username, if the user is not signed in, redirect to homepage
  useEffect(() => {
    if (!userName) {
      navigate("/");
    } else {
      socket.emit("joinRoom", roomName);

      // Online users
      socket.emit("newUserAdd", { userName, roomName });
      socket.on("getUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      return () => {
        socket.off("getUsers");
        socket.off("receiveMessage");
      };
    }
  }, [userName, navigate, roomName]);

  // Load previous messages on a room
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

  const handleRedirectionHomepage = () => {
    navigate("/");
  };

  // Sending a message on a room
  const handleSendMessage = async () => {
    if (message.trim()) {
      const messageData = { roomName, userName, message };
      socket.emit("sendMessage", messageData);
      setMessage("");
    }
    /* try {
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
    } */
  };

  // {x} is typing...
  const handleTyping = () => {
    if (!isTyping) {
      socket.emit("typing", { user: userName, room: roomName });
      setIsTyping(true);
    }
  };

  const handleStopTyping = () => {
    socket.emit("stopTyping", { room: roomName });
    setIsTyping(false);
  };

  useEffect(() => {
    socket.on("typing", (data) => {
      setTypingUser(data.user);
    });

    socket.on("stopTyping", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [roomName]);

  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="text-center mt-4 mx-2">
        <h1 className="text-2xl font-bold">
          Welcome to <span className="text-4xl">{roomName}</span> chat room.
        </h1>
        <p className="text-sm italic">Start typing and talking with people!</p>
        <button
          className="absolute top-0 right-0 m-2 bg-gray-600 text-gray-100 text-sm py-1 px-2 rounded hover:bg-gray-800"
          onClick={handleRedirectionHomepage}
        >
          Change Room
        </button>
        <hr />
        <div className="text-right pr-2">
          <h2 className="font-semibold text-md underline">Online Users</h2>
          <ul className="list-none">
            {onlineUsers.map((user, index) => (
              <li key={index} className="text-sm text-gray-600">
                <span class="h-2 w-2 bg-green-400 rounded-full inline-block"></span>
                {user.userName}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h-full w-6/12 m-auto block pt-4 overflow-y-scroll px-5">
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
        <div ref={messageEndRef} />
      </div>

      <div className="my-4 mx-2 text-center">
        {typingUser && (
          <div className="text-xs italic">{typingUser} is typing...</div>
        )}
        <input
          placeholder="Enter your message here"
          className="border border-gray-600 py-1 px-2 rounded-md"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          onBlur={handleStopTyping}
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
