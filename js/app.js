const App = (() => {
  let drawingBase64 = '';
  let description = '';
  let story = '';
  let audioBlob = null;
  let videoBlob = null;

  const $ = id => document.getElementById(id);

  function init() {
    DrawCanvas.init();
    I18N.apply();

    const savedLang = localStorage.getItem('mse_lang') || 'id';
    I18N.setLang(savedLang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === savedLang);
      btn.addEventListener('click', () => {
        I18N.setLang(btn.dataset.lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    $('btn-dismiss-error').addEventListener('click', () => $('error-banner').classList.add('hidden'));
    $('btn-done').addEventListener('click', startProcessing);
    $('btn-start-over').addEventListener('click', resetAll);
  }

  function showPhase(id) {
    document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
    $(id).classList.add('active');
  }

  function setStep(num) {
    document.querySelectorAll('.step').forEach(s => {
      const n = parseInt(s.dataset.step);
      s.classList.remove('active', 'done');
      if (n < num) s.classList.add('done');
      else if (n === num) s.classList.add('active');
    });
  }

  function updateProgress(pct) {
    $('proc-progress').style.width = pct + '%';
  }

  function showError(msg) {
    $('error-text').textContent = msg;
    $('error-banner').classList.remove('hidden');
  }

  async function startProcessing() {
    drawingBase64 = DrawCanvas.toBase64();
    showPhase('phase-processing');

    try {
      setStep(2);
      $('proc-emoji').textContent = '\uD83E\uDD14';
      $('proc-title').textContent = I18N.t('proc.looking');
      $('proc-detail').textContent = '';
      updateProgress(10);

      const result = await Pipeline.process(drawingBase64, I18N.getLang());

      description = result.description;
      story = result.story;
      audioBlob = result.audioBlob;

      if (!description && !story) throw new Error('No story generated');
      if (!audioBlob) throw new Error('No audio returned');

      updateProgress(70);

      setStep(5);
      $('proc-emoji').textContent = '\uD83C\uDFAC';
      $('proc-title').textContent = I18N.t('proc.rendering');
      $('proc-detail').textContent = 'FFmpeg.wasm loading...';
      updateProgress(75);

      await VideoMaker.load(pct => {
        updateProgress(75 + Math.round(pct * 0.15));
      });
      $('proc-detail').textContent = '';

      videoBlob = await VideoMaker.createVideo(DrawCanvas.toDataURL(), audioBlob);
      updateProgress(100);

      showResult();

    } catch (err) {
      console.error('Processing error:', err);
      const msg = err.message || '';
      if (msg.includes('Pipeline') || msg.includes('fetch') || msg.includes('NetworkError')) {
        showError(I18N.t('error.ollama') + ' ' + msg);
      } else if (msg.includes('FFmpeg') || msg.includes('ffmpeg')) {
        showError(I18N.t('error.ffmpeg') + ' ' + msg);
      } else {
        showError(I18N.t('error.generic') + ' ' + msg);
      }
      showPhase('phase-draw');
      setStep(1);
    }
  }

  function showResult() {
    showPhase('phase-result');
    setStep(5);

    $('result-drawing').src = DrawCanvas.toDataURL();
    $('result-description').textContent = description;
    $('result-story').textContent = story;

    const audioUrl = URL.createObjectURL(audioBlob);
    $('result-audio').src = audioUrl;

    const videoUrl = URL.createObjectURL(videoBlob);
    $('result-video').src = videoUrl;
    $('btn-download-video').href = videoUrl;
  }

  function resetAll() {
    drawingBase64 = '';
    description = '';
    story = '';
    audioBlob = null;
    videoBlob = null;
    showPhase('phase-draw');
    setStep(1);
    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  document.addEventListener('DOMContentLoaded', init);
  return { init: init };
})();