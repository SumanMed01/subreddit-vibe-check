// functions/api/reddit.js
// Cloudflare Pages Function — runs server-side, so no CORS issue and no Reddit
// account/API key needed. Hits Reddit's public read-only JSON feed directly.

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const subreddit = url.searchParams.get('sub') || url.searchParams.get('subreddit');

  if (!subreddit) {
    return json({ error: 'Missing ?sub=<subreddit> parameter' }, 400);
  }

  // Basic sanity check on the subreddit name
  if (!/^[a-zA-Z0-9_]{2,21}$/.test(subreddit)) {
    return json({ error: 'That doesn\'t look like a valid subreddit name' }, 400);
  }

  const redditUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=50&raw_json=1`;

  try {
    const res = await fetch(redditUrl, {
      headers: {
        // Reddit blocks requests with no/default User-Agent — this one is required.
        'User-Agent': 'subreddit-vibe-check/1.0 (Cloudflare Pages Function)'
      }
    });

    if (!res.ok) {
      return json({ error: `Reddit returned ${res.status}. The subreddit may be private, banned, or misspelled.` }, res.status);
    }

    const data = await res.json();
    const children = data?.data?.children || [];

    if (children.length === 0) {
      return json({ error: 'No posts found for that subreddit.' }, 404);
    }

    const posts = children.map(c => ({
      id: c.data.id,
      title: c.data.title,
      author: c.data.author,
      permalink: `https://www.reddit.com${c.data.permalink}`,
      ups: c.data.ups,
      num_comments: c.data.num_comments
    }));

    return json({ posts, subreddit });

  } catch (err) {
    return json({ error: 'Failed to reach Reddit: ' + err.message }, 502);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}