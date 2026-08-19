# The Subreddit Vibe Check

A modern sentiment-analysis dashboard that analyzes the titles of Hot posts from a selected subreddit and visualizes the overall community vibe.

## Features

* Search for a public subreddit
* Fetch up to 50 Hot posts
* Client-side sentiment analysis
* Positive, Neutral, and Negative classification
* Overall subreddit vibe
* Sentiment percentage cards
* Sentiment distribution visualization
* Post score, comments, and author information
* Quick subreddit suggestions
* Responsive dark dashboard UI
* GSAP entrance animations
* Loading and error handling
* Demo fallback while Reddit Data API approval is pending

## Tech Stack

* React
* Vite
* JavaScript
* CSS
* Sentiment.js
* GSAP
* Reddit Data API
* Cloudflare Pages
* Cloudflare Pages Functions

## How It Works

The application uses React for the user interface and client-side sentiment analysis.

The user enters a subreddit such as:

`javascript`

The frontend sends a request to:

`/api/reddit?subreddit=javascript`

The backend route is handled by:

`functions/api/reddit.js`

The Cloudflare Pages Function authenticates with Reddit and requests up to 50 Hot posts from the selected subreddit.

The returned post titles are then analyzed in the browser using the `sentiment` JavaScript library.

Each title is classified as:

* Positive
* Neutral
* Negative

The dashboard then calculates the overall subreddit vibe and displays sentiment statistics.

## Project Structure

```text
subreddit-vibe-check/
├── functions/
│   └── api/
│       └── reddit.js
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── mockPosts.js
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Reddit API

The production backend is implemented using a Cloudflare Pages Function:

`functions/api/reddit.js`

Reddit API credentials are stored securely as environment variables and are never exposed in the React frontend or committed to GitHub.

Required environment variables:

```env
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
```

Reddit Data API access is currently pending approval.

Until API credentials are available, the application automatically switches to a clearly labelled **Demo Mode** using sample post data so the sentiment-analysis functionality and dashboard can still be demonstrated.

## Local Development

Clone the repository:

```bash
git clone https://github.com/SumanMed01/subreddit-vibe-check.git
```

Enter the project directory:

```bash
cd subreddit-vibe-check
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

`http://localhost:5173`

## Production Build

Create a production build with:

```bash
npm run build
```

The generated production files will be placed inside:

`dist/`

## Linting

Run:

```bash
npm run lint
```

The project uses Oxlint for code-quality checks.

## Deployment

The project is designed to be deployed using **Cloudflare Pages** with GitHub integration.

Recommended build configuration:

```text
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: /
```

The backend route:

`functions/api/reddit.js`

is automatically deployed by Cloudflare Pages Functions as:

`/api/reddit`

## API Flow

```text
User
  ↓
React Dashboard
  ↓
/api/reddit
  ↓
Cloudflare Pages Function
  ↓
Reddit OAuth
  ↓
Reddit Hot Posts API
  ↓
50 Post Titles
  ↓
Sentiment.js
  ↓
Sentiment Dashboard
```

## Author

**Suman Medhi**

Built as part of a Full Stack Developer Internship take-home assignment.
