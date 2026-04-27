async function extractUrlTitle(url: string) {
  try {
     if (url.includes('youtube.com') || url.includes('youtu.be')) {
         const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
         const res = await fetch(oembedUrl);
         const data = await res.json();
         return data.title;
     }

     const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
     const response = await fetch(proxyUrl);
     const data = await response.json();
     if (data.contents) {
        const match = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (match && match[1]) {
           return match[1].trim();
        }
     }
  } catch (err) {
    console.error(err);
  }
}

extractUrlTitle("https://youtu.be/U-frK0b7msY?si=wyOIYCQxQ-Of5Yvc").then(console.log);
extractUrlTitle("https://thetrendgrid.com/digital-detox-challenge-why-gen-z-is-s").then(console.log);
