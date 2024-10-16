import { useParams } from "react-router-dom";

export default function Room() {
  const { roomName } = useParams();

  return (
    <div class="flex flex-col justify-between h-screen">
      <div class="text-center mt-4 mx-2">
        <h1 class="text-2xl font-bold">
          Welcome to <span class="text-4xl">{roomName}</span> chat room
        </h1>
        <p class="text-sm italic">Start typing and talking with people!</p>
      </div>
      <div class=" h-full m-2">Chat Area</div>
      <div class="mb-4 mx-2 text-center">
        <input
          placeholder="Enter your message here"
          class="border border-gray-600 py-1 px-2 rounded-md"
        ></input>
        <button class="ml-4 bg-blue-400 text-gray-100 text-sm py-1 px-2 rounded hover:bg-blue-600">
          Send
        </button>
      </div>
    </div>
  );
}
