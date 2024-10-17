import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function App() {
  const navigate = useNavigate();
  const { setUserName } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (token !== "undefined" && storedUsername) {
      setIsAuthenticated(true);
      setUserName(storedUsername);
    } else {
      localStorage.clear();
      setIsAuthenticated(false);
    }

    fetchRooms();
  }, [setUserName]);

  // Sign In
  const handleSignIn = async () => {
    if (!username || !password) {
      alert("Username and password are required.");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/check-username/${username}`
    );
    const data = await response.json();
    if (!data.exists) {
      alert("Username does not exist.");
      return;
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        setIsAuthenticated(true);
        window.location.reload();
      } else {
        alert("Failed signing in. Try again.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Sign Out
  const handleSignOut = () => {
    localStorage.clear();
    setUserName("");
    setIsAuthenticated(false);
    window.location.reload();
  };

  // Redirect to Sign Up page
  const handleSignUpRedirection = () => {
    navigate("/signup");
  };

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:5000/rooms");
      const data = await response.json();

      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Joining a Room
  const handleJoin = async (roomName) => {
    if (!roomName) {
      alert("Room name cannot be empty.");
      return;
    }

    try {
      const storedUsername = localStorage.getItem("username");
      const response = await fetch("http://localhost:5000/join-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room: roomName, storedUsername }),
      });

      const data = await response.json();

      if (data.success) {
        setUserName(localStorage.getItem("username"));
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
        {isAuthenticated ? (
          <div>
            <p className="text-sm italic">
              Hey <span>{username}</span>! Enter the room name you want to join
              and start talking with people!
            </p>
            <button
              className="bg-gray-600 text-gray-200 px-16 py-2 rounded hover:bg-gray-800 hover:text-white mt-6"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
            <hr className="my-6"></hr>
          </div>
        ) : (
          <p className="text-sm italic">
            Sign in or sign up to start talking with people!
          </p>
        )}
      </div>

      {isAuthenticated ? (
        <div>
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
            <button
              className="bg-gray-600 text-gray-200 px-16 py-2 rounded hover:bg-gray-800 hover:text-white mt-6"
              onClick={() => handleJoin(room)}
            >
              Join
            </button>
          </fieldset>

          <hr className="my-6"></hr>

          <h2 className="underline font-bold text-center mb-6">
            Popular Rooms
          </h2>
          <div className="w-full text-center flex flex-row flex-wrap justify-center gap-4">
            {rooms.map((room) => (
              <div
                key={room.name}
                className="p-4 bg-gray-100 rounded shadow mb-4 cursor-pointer hover:bg-gray-200"
                onClick={() => handleJoin(room.name)}
              >
                <p>
                  <span className="font-semibold">{room.name}</span> (User
                  Count: {room.userCount})
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            className="m-auto block bg-gray-600 text-gray-200 px-16 py-2 rounded hover:bg-gray-800 hover:text-white mt-6"
            onClick={handleSignUpRedirection}
          >
            Click to Sign Up
          </button>
          <p class="text-xs italic text-center my-6">or</p>
          <fieldset className="flex flex-col items-center gap-2">
            <label for="username" className="italic">
              User Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your user name here"
              className="rounded border border-gray-800 px-10 py-2 text-center"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            ></input>
            <label for="password" className="italic">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password here"
              className="rounded border border-gray-800 px-10 py-2 text-center"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <button
              className="bg-gray-600 text-gray-200 px-16 py-2 rounded hover:bg-gray-800 hover:text-white mt-6"
              onClick={handleSignIn}
            >
              Sign In
            </button>
          </fieldset>
        </div>
      )}
    </div>
  );
}
