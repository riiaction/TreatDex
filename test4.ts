async function extractUrlTitle(url: string) {
  try {
    const res = await fetch(`https://jsonlink.io/api/extract?url=${url}`);
    const data = await res.json();
    console.log(data);
    if (data.title) {
        return data.title;
    }
  } catch (err) {
    console.error(err);
  }
}

extractUrlTitle("https://youtu.be/U-frK0b7msY?si=wyOIYCQxQ-Of5Yvc");
