async function extractUrlTitle(url: string) {
  try {
     const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
     const response = await fetch(proxyUrl);
     const text = await response.text();
     const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
     if (match && match[1]) {
        return match[1].trim();
     }
  } catch (err) {
    console.error(err);
  }
}
extractUrlTitle("https://thetrendgrid.com/digital-detox-challenge-why-gen-z-is-s").then(console.log);
