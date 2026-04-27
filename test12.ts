async function run() {
    const res = await fetch("https://noembed.com/embed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    console.log(await res.json());
}
run();
