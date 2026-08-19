import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api/reddit": {
        target: "https://www.reddit.com",
        changeOrigin: true,

        headers: {
          "User-Agent": "SubredditVibeCheck/1.0",
        },

        rewrite: (path) => {
          const url = new URL(path, "http://localhost");
          const subreddit = url.searchParams.get("subreddit");

          return `/r/${encodeURIComponent(
            subreddit || "javascript"
          )}/hot.json?limit=50&raw_json=1`;
        },
      },
    },
  },
});