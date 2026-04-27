async function extractUrlTitle(url: string) {
  try {
    const res = await fetch(`https://api.dub.co/metatags?url=${url}`);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

extractUrlTitle("https://thetrendgrid.com/digital-detox-challenge-why-gen-z-is-s");
