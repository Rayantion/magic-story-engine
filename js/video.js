const VideoMaker = (() => {
  let ffmpeg = null;

  async function load(progressCb) {
    if (ffmpeg) return;
    if (typeof FFmpeg === 'undefined') throw new Error('FFmpeg.wasm not loaded');

    ffmpeg = new FFmpeg.FFmpeg();
    ffmpeg.on('log', () => {});
    ffmpeg.on('progress', ({ progress }) => {
      if (progressCb) progressCb(Math.round(progress * 100));
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });
  }

  async function createVideo(imageDataURL, audioBlob) {
    if (!ffmpeg) throw new Error('FFmpeg not loaded');

    const imageBlob = await (await fetch(imageDataURL)).blob();

    await ffmpeg.writeFile('image.png', new Uint8Array(await imageBlob.arrayBuffer()));
    await ffmpeg.writeFile('audio.mp3', new Uint8Array(await audioBlob.arrayBuffer()));

    await ffmpeg.exec([
      '-loop', '1',
      '-i', 'image.png',
      '-i', 'audio.mp3',
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-vf', 'scale=720:-2:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:black',
      '-r', '10',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      '-movflags', '+faststart',
      'output.mp4'
    ]);

    const data = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });

    await ffmpeg.deleteFile('image.png');
    await ffmpeg.deleteFile('audio.mp3');
    await ffmpeg.deleteFile('output.mp4');

    return videoBlob;
  }

  return { load, createVideo };
})();