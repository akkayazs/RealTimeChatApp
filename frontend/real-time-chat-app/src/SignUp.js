import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs-react";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
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
          type="text"
          placeholder="Enter your password here"
          className="rounded border border-gray-800 px-10 py-2 text-center"
          maxLength={100}
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
