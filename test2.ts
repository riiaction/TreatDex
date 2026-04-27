async function extractUrlTitle(url: string) {
  try {
    const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.status === 'success' && data.data && data.data.title) {
        console.log("Microlink Title for", url, ":", data.data.title);
        return data.data.title;
    }
  } catch (err) {
    console.error(err);
  }
}

extractUrlTitle("https://youtu.be/U-frK0b7msY?si=wyOIYCQxQ-Of5Yvc").then(() => 
extractUrlTitle("https://thetrendgrid.com/digital-detox-challenge-why-gen-z-is-s"));
