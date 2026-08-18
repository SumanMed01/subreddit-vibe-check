import { useState } from "react";
import "./App.css";

function App() {
  const [subreddit, setSubreddit] = useState("");

  return (
    <main>
      <h1>The Subreddit Vibe Check</h1>
      <p>Discover what Reddit is feeling right now.</p>

      <div>
        <span>r/</span>

        <input
          type="text"
          placeholder="javascript"
          value={subreddit}
          onChange={(e) => setSubreddit(e.target.value)}
        />

        <button>Check Vibe</button>
      </div>
    </main>
  );
}

export default App;