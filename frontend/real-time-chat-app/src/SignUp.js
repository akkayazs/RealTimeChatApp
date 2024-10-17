import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs-react";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!username || !password) {
      alert("Username and password are required.");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/check-username/${username}`
    );
    const data = await response.json();
    if (data.exists) {
      alert("Username already exists.");
      return;
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 12 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    try {
      const response = await fetch("http://localhost:5000/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, hashedPassword }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        navigate("/");
      } else {
        alert("Failed signing up. Try again later.");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred while signing up.");
    }
  };

  return (
    <div>
      <fieldset className="flex flex-col items-center gap-2">
        <label htmlFor="username" className="mt-6 italic">
          User Name
        </label>
        <input
          id="username"
          type="text"
          placeholder="Enter your user name here"
          className="rounded border border-gray-800 px-10 py-2 text-center"
          maxLength={100}
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <label htmlFor="password" className="mt-6 italic">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password here"
          className="rounded border border-gray-800 px-10 py-2 text-center"
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}"
          title="Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character."
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>

        <button
          className="bg-gray-600 text-gray-200 px-16 py-2 rounded hover:bg-gray-800 hover:text-white mt-6"
          onClick={handleSignUp}
        >
          Sign Up
        </button>
      </fieldset>
    </div>
  );
};

export default SignUp;
