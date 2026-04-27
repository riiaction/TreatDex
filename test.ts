async function extractUrlTitle(url: string) {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    if (data.contents) {
      const match = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match && match[1]) {
        console.log("Title for", url, ":", match[1]);
        return match[1];
      } else {
        console.log("No match found for", url);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

extractUrlTitle("https://youtu.be/U-frK0b7msY?si=wyOIYCQxQ-Of5Yvc").then(() => 
extractUrlTitle("https://google.com"));
