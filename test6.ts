async function extractUrlTitle(url: string) {
  try {
     if (url.includes('youtube.com') || url.includes('youtu.be')) {
         const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
         const res = await fetch(oembedUrl);
         const data = await res.json();
         console.log('Youtube Title:', data.title);
         return data.title;
     }
  } catch (err) {
    console.error(err);
  }
}

extractUrlTitle("https://youtu.be/U-frK0b7msY?si=wyOIYCQxQ-Of5Yvc");
