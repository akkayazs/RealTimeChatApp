import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function App() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { setUserName } = useUser();

  const handleJoin = async () => {
    try {
      const response = await fetch("http://localhost:5000/join-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room, name }),
      });

      const data = await response.json();

      if (data.success) {
        setUserName(name);
        navigate(`/${data.roomName}`);
      } else {
        alert("Failed joining room. Try again later.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="text-center m-10">
        <h1 className="text-4xl font-bold">
          Welcome to Real Time Chat Application
        </h1>
        <p className="text-sm italic">
          Enter the room name you want to join and start talking with people!
        </p>
      </div>

      <fieldset className="flex flex-col items-center gap-2">
        <label for="room" className="italic">
          Room Name
        </label>
        <input
          id="room"
          type="text"
          placeholder="Enter the room name here"
          className="rounded border border-gray-800 px-10 py-2 text-center"
          maxLength={100}
          required
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        ></input>
        <label htmlFor="name" className="mt-6 italic">
          User Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter your user name here"
          className="rounded border border-gray-800 px-10 py-2 text-center"
          maxLength={100}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></input>
        <button
          className="bg-gray-600 text-gray-200 px-16 py-2 rounded hover:bg-gray-800 hover:text-white mt-6"
          onClick={handleJoin}
        >
          Join
        </button>
      </fieldset>
    </div>
  );
}
