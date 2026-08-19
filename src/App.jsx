import { useEffect, useMemo, useState } from "react";
import Sentiment from "sentiment";
import gsap from "gsap";
import { mockPosts } from "./mockPosts";
import "./App.css";

const sentimentAnalyzer = new Sentiment();

function analyzePosts(posts) {
  return posts.map((post) => {
    const analysis = sentimentAnalyzer.analyze(post.title);

    let sentiment = "Neutral";

    if (analysis.score > 0) {
      sentiment = "Positive";
    } else if (analysis.score < 0) {
      sentiment = "Negative";
    }

    return {
      ...post,
      sentiment,
      sentimentScore: analysis.score,
    };
  });
}

function App() {
  const [subreddit, setSubreddit] = useState("");
  const [activeSubreddit, setActiveSubreddit] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".hero > *",
      {
        opacity: 0,
        y: 25,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity",
      }
    );
  });

  return () => ctx.revert();
}, []);

useEffect(() => {
  if (!posts.length) return;

  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".demo-banner, .dashboard-heading, .summary-card, .sentiment-distribution, .post-card",
      {
        opacity: 0,
        y: 25,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "power3.out",
        clearProps: "transform,opacity",
      }
    );
  });

  return () => ctx.revert();
}, [posts]);

  const summary = useMemo(() => {
    if (!posts.length) return null;

    const positive = posts.filter(
      (post) => post.sentiment === "Positive"
    ).length;

    const neutral = posts.filter(
      (post) => post.sentiment === "Neutral"
    ).length;

    const negative = posts.filter(
      (post) => post.sentiment === "Negative"
    ).length;

    const total = posts.length;

    const positivePercent = Math.round((positive / total) * 100);
    const neutralPercent = Math.round((neutral / total) * 100);
    const negativePercent = Math.round((negative / total) * 100);

    let overallVibe = "Neutral";
    let emoji = "😐";

    if (positive > negative && positive > neutral) {
      overallVibe = "Positive";
      emoji = "😊";
    } else if (negative > positive && negative > neutral) {
      overallVibe = "Negative";
      emoji = "😕";
    }

    return {
      positive,
      neutral,
      negative,
      positivePercent,
      neutralPercent,
      negativePercent,
      overallVibe,
      emoji,
    };
  }, [posts]);

  const fetchPosts = async () => {
    const cleanSubreddit = subreddit
      .trim()
      .replace(/^r\//i, "")
      .replace(/\s+/g, "");

    if (!cleanSubreddit) {
      setError("Please enter a subreddit.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setDemoMode(false);
      setPosts([]);
      setActiveSubreddit(cleanSubreddit);

      const response = await fetch(
        `/api/reddit?subreddit=${encodeURIComponent(cleanSubreddit)}`
      );

      if (!response.ok) {
        throw new Error("Reddit API unavailable");
      }

      const data = await response.json();

      if (!data?.data?.children?.length) {
        throw new Error("No Reddit posts returned");
      }

      const redditPosts = data.data.children.slice(0, 50).map((item) => {
        const post = item.data;

        return {
          id: post.id,
          title: post.title,
          author: post.author,
          score: post.score,
          comments: post.num_comments,
          permalink: post.permalink,
        };
      });

      setPosts(analyzePosts(redditPosts));
    } catch (err) {
      console.warn("Using demo data:", err.message);

      setDemoMode(true);
      setPosts(analyzePosts(mockPosts));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Reddit Sentiment Dashboard</p>

        <h1>The Subreddit Vibe Check</h1>

        <p className="subtitle">
          Discover what Reddit is feeling right now.
        </p>

        <form className="search-box" onSubmit={handleSubmit}>
          <span>r/</span>

          <input
            type="text"
            placeholder="javascript"
            value={subreddit}
            onChange={(e) => setSubreddit(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Check Vibe"}
          </button>
        </form>
        <div className="quick-subreddits">
  <span>Try:</span>

  {["javascript", "reactjs", "webdev", "programming"].map((name) => (
    <button
      key={name}
      type="button"
      onClick={() => setSubreddit(name)}
    >
      r/{name}
    </button>
  ))}
</div>

        {error && <p className="error-message">{error}</p>}
      </section>

      {posts.length > 0 && summary && (
        <section className="dashboard">
          {demoMode && (
            <div className="demo-banner">
              <strong>Demo Mode</strong>
              <span>
                Reddit API approval is currently pending. Sample posts are being
                used to demonstrate sentiment analysis.
              </span>
            </div>
          )}

          <div className="dashboard-heading">
            <div>
              <p className="eyebrow">Sentiment analysis</p>
              <h2>r/{activeSubreddit}</h2>
            </div>

            <div className="overall-vibe">
              <span>{summary.emoji}</span>

              <div>
                <small>Overall vibe</small>
                <strong>{summary.overallVibe}</strong>
              </div>
            </div>
          </div>

          <div className="summary-grid">
            <article className="summary-card positive-card">
              <span className="summary-icon">😊</span>
              <p>Positive</p>
              <h3>{summary.positivePercent}%</h3>
              <small>{summary.positive} posts</small>
            </article>

            <article className="summary-card neutral-card">
              <span className="summary-icon">😐</span>
              <p>Neutral</p>
              <h3>{summary.neutralPercent}%</h3>
              <small>{summary.neutral} posts</small>
            </article>

            <article className="summary-card negative-card">
              <span className="summary-icon">😕</span>
              <p>Negative</p>
              <h3>{summary.negativePercent}%</h3>
              <small>{summary.negative} posts</small>
            </article>
          </div>

          <div className="sentiment-distribution">
  <div className="distribution-header">
    <span>Sentiment distribution</span>
    <span>{posts.length} posts analyzed</span>
  </div>

  <div className="distribution-bar">
    <div
      className="distribution-positive"
      style={{ width: `${summary.positivePercent}%` }}
    />

    <div
      className="distribution-neutral"
      style={{ width: `${summary.neutralPercent}%` }}
    />

    <div
      className="distribution-negative"
      style={{ width: `${summary.negativePercent}%` }}
    />
  </div>

  <div className="distribution-legend">
    <span>🟢 Positive {summary.positivePercent}%</span>
    <span>🟡 Neutral {summary.neutralPercent}%</span>
    <span>🔴 Negative {summary.negativePercent}%</span>
  </div>
</div>

          <div className="posts-section">
            <div className="posts-heading">
              <div>
                <p className="eyebrow">
                  {demoMode ? "Sample analysis" : "Live Reddit analysis"}
                </p>

                <h2>Hot Posts</h2>
              </div>

              <span className="post-count">
                {posts.length} {demoMode ? "Demo Posts" : "Hot Posts"}
              </span>
            </div>

            <div className="posts-grid">
              {posts.map((post) => (
                <article className="post-card" key={post.id}>
                  <div className="post-top">
                    <span
                      className={`sentiment ${post.sentiment.toLowerCase()}`}
                    >
                      {post.sentiment}
                    </span>

                    <span className="sentiment-score">
                      Sentiment{" "}
                      {post.sentimentScore > 0
                        ? `+${post.sentimentScore}`
                        : post.sentimentScore}
                    </span>
                  </div>

                  <h3>{post.title}</h3>

                  <div className="post-meta">
                    <span>▲ {post.score.toLocaleString()}</span>

                    <span>💬 {post.comments.toLocaleString()}</span>

                    <span>u/{post.author}</span>
                  </div>

                  {!demoMode && (
                    <a
                      href={`https://www.reddit.com${post.permalink}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Reddit →
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;