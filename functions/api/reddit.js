export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const url = new URL(request.url);

    const subreddit = url.searchParams
      .get("subreddit")
      ?.trim()
      .replace(/^r\//i, "");

    if (!subreddit) {
      return Response.json(
        { error: "Subreddit is required." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]{2,21}$/.test(subreddit)) {
      return Response.json(
        { error: "Invalid subreddit name." },
        { status: 400 }
      );
    }

    const clientId = env.REDDIT_CLIENT_ID;
    const clientSecret = env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.json(
        {
          error: "Reddit API credentials are not configured yet.",
          approvalPending: true,
        },
        { status: 503 }
      );
    }

    const credentials = btoa(`${clientId}:${clientSecret}`);

    const tokenResponse = await fetch(
      "https://www.reddit.com/api/v1/access_token",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "web:subreddit-vibe-check:1.0 (by /u/suman_vibecheck)",
        },

        body: new URLSearchParams({
          grant_type: "client_credentials",
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error(
        "Reddit token error:",
        await tokenResponse.text()
      );

      return Response.json(
        { error: "Unable to authenticate with Reddit." },
        { status: 502 }
      );
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return Response.json(
        { error: "Reddit did not return an access token." },
        { status: 502 }
      );
    }

    const redditResponse = await fetch(
      `https://oauth.reddit.com/r/${encodeURIComponent(
        subreddit
      )}/hot?limit=50&raw_json=1`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent":
            "web:subreddit-vibe-check:1.0 (by /u/suman_vibecheck)",
        },
      }
    );

    if (!redditResponse.ok) {
      return Response.json(
        {
          error: "Subreddit not found or Reddit API request failed.",
        },
        { status: redditResponse.status }
      );
    }

    const redditData = await redditResponse.json();

    return Response.json(redditData);
  } catch (error) {
    console.error("Cloudflare API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}