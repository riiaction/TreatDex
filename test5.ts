async function extractUrlTitle(url: string) {
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const text = await response.text();
    const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    console.log(match ? match[1] : null);
  } catch (err) {
    console.error(err);
  }
}

extractUrlTitle("https://youtu.be/U-frK0b7msY?si=wyOIYCQxQ-Of5Yvc").then(() => 
extractUrlTitle("https://thetrendgrid.com/digital-detox-challenge-why-gen-z-is-s"));
