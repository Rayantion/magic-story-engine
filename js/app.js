const App = (() => {
  // State
  let drawingBase64 = '';
  let description = '';
  let story = '';
  let audioBlob = null;
  let videoBlob = null;

  // DOM refs
  const $ = id => document.getElementById(id);

  function init() {
    DrawCanvas.init();
    I18N.apply();

    // Restore saved keys
    const savedKey = localStorage.getItem('mse_elevenlabs_key');
    if (savedKey) $('input-elevenlabs-key').value = savedKey;
    const savedUrl = localStorage.getItem('mse_ollama_url');
    if (savedUrl) $('input-ollama-url').value = savedUrl;
    const savedVision = localStorage.getItem('mse_vision_model');
    if (savedVision) $('input-vision-model').value = savedVision;
    const savedText = localStorage.getItem('mse_text_model');
    if (savedText) $('input-text-model').value = savedText;

    // Language buttons
    const savedLang = localStorage.getItem('mse_lang') || 'id';
    I18N.setLang(savedLang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === savedLang);
      btn.addEventListener('click', () => {
        I18N.setLang(btn.dataset.lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    // API modal
    $('btn-save-keys').addEventListener('click', saveKeysAndStart);
    $('btn-dismiss-error').addEventListener('click', () => $('error-banner').classList.add('hidden'));

    // Drawing done
    $('btn-done').addEventListener('click', startProcessing);

    // Start over
    $('btn-start-over').addEventListener('click', resetAll);

    // Show API modal if no key saved
    if (!savedKey) {
      $('api-modal').classList.remove('hidden');
    } else {
      $('api-modal').classList.add('hidden');
      configureAPIs();
    }
  }

  function saveKeysAndStart() {
    const key = $('input-elevenlabs-key').value.trim();
    if (!key) {
      showError(I18N.t('error.no_keys'));
      return;
    }
    localStorage.setItem('mse_elevenlabs_key', key);
    localStorage.setItem('mse_ollama_url', $('input-ollama-url').value.trim());
    localStorage.setItem('mse_vision_model', $('input-vision-model').value.trim());
    localStorage.setItem('mse_text_model', $('input-text-model').value.trim());
    $('api-modal').classList.add('hidden');
    configureAPIs();
  }

  function configureAPIs() {
    const key = localStorage.getItem('mse_elevenlabs_key');
    const url = localStorage.getItem('mse_ollama_url') || 'https://ollama.ai';
    const vision = localStorage.getItem('mse_vision_model') || 'llava';
    const text = localStorage.getItem('mse_text_model') || 'llama3.2';

    ElevenLabsAPI.configure(key);
    OllamaAPI.configure(url, vision, text);
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
    if (!localStorage.getItem('mse_elevenlabs_key')) {
      $('api-modal').classList.remove('hidden');
      return;
    }

    drawingBase64 = DrawCanvas.toBase64();
    showPhase('phase-processing');

    try {
      // Step 2: Describe drawing
      setStep(2);
      $('proc-emoji').textContent = '🤔';
      $('proc-title').textContent = I18N.t('proc.looking');
      $('proc-detail').textContent = '';
      updateProgress(10);
      description = await OllamaAPI.describeDrawing(drawingBase64);

      if (!description) throw new Error('No description returned');
      updateProgress(30);

      // Step 3: Generate story
      setStep(3);
      $('proc-emoji').textContent = '✨';
      $('proc-title').textContent = I18N.t('proc.writing');
      story = await OllamaAPI.generateStory(description);

      if (!story) throw new Error('No story returned');
      updateProgress(50);

      // Step 4: Text to speech
      setStep(4);
      $('proc-emoji').textContent = '🎙️';
      $('proc-title').textContent = I18N.t('proc.speaking');
      audioBlob = await ElevenLabsAPI.textToSpeech(story);

      if (!audioBlob) throw new Error('No audio returned');
      updateProgress(70);

      // Step 5: Create video
      setStep(5);
      $('proc-emoji').textContent = '🎬';
      $('proc-title').textContent = I18N.t('proc.rendering');
      $('proc-detail').textContent = 'FFmpeg.wasm loading...';
      updateProgress(75);

      await VideoMaker.load(pct => {
        updateProgress(75 + Math.round(pct * 0.15));
      });
      $('proc-detail').textContent = '';

      videoBlob = await VideoMaker.createVideo(DrawCanvas.toDataURL(), audioBlob);
      updateProgress(100);

      // Show result
      showResult();

    } catch (err) {
      console.error('Processing error:', err);
      const msg = err.message || '';
      if (msg.includes('Ollama') || msg.includes('ollama') || msg.includes('fetch')) {
        showError(I18N.t('error.ollama') + ' ' + msg);
      } else if (msg.includes('ElevenLabs') || msg.includes('elevenlabs') || msg.includes('xi-api')) {
        showError(I18N.t('error.elevenlabs') + ' ' + msg);
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