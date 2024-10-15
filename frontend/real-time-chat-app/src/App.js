export default function App() {
  return (
    <div>
      <div class="text-center m-10">
        <h1 class="text-4xl font-bold">
          Welcome to Real Time Chat Application
        </h1>
        <p class="text-sm italic">
          Enter the room name you want to join and start talking with people!
        </p>
      </div>

      <fieldset class="flex flex-col items-center gap-2">
        <label for="room" class="italic">
          Room Name
        </label>
        <input
          id="room"
          type="text"
          placeholder="Enter the room name here"
          class="rounded border border-gray-800 px-10 py-2"
        ></input>
        <label for="name" class="mt-6 italic">
          User Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter your user name here"
          class="rounded border border-gray-800 px-10 py-2"
        ></input>
        <button class="bg-gray-600 text-gray-200 px-16 py-2 rounded hover:bg-gray-800 hover:text-white mt-6">
          Join
        </button>
      </fieldset>
    </div>
  );
}
