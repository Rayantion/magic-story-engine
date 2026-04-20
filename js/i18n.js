const I18N = (() => {
  const strings = { id: {}, en: {}, 'zh-TW': {} };

  strings.id = {
    'app.title': 'Mesin Cerita Ajaib',
    'app.subtitle': 'Gambar lukisan, dapatkan video cerita!',
    'step.draw': 'Gambar',
    'step.describe': 'Deskripsi',
    'step.story': 'Cerita',
    'step.voice': 'Suara',
    'step.video': 'Video',
    'draw.size': 'Ukuran',
    'draw.eraser': 'Penghapus',
    'draw.clear': 'Hapus',
    'draw.done': 'Selesai! Buat Ceritaku',
    'api.title': 'Setup Kunci API',
    'api.hint': 'Masukkan kunci API Anda. Kunci hanya disimpan di perangkat ini.',
    'api.elevenlabs': 'Kunci API ElevenLabs',
    'api.ollama_model': 'Model Visi',
    'api.text_model': 'Model Teks',
    'api.save': 'Simpan & Mulai',
    'proc.looking': 'AI sedang melihat lukisanmu...',
    'proc.writing': 'AI sedang menulis ceritamu...',
    'proc.speaking': 'AI sedang membuat suara...',
    'proc.rendering': 'Membuat video ceritamu...',
    'result.title': 'Cerita Ajaibmu Siap!',
    'result.drawing': 'Lukisanmu',
    'result.description': 'Deskripsi AI',
    'result.story': 'Cerita',
    'result.audio': 'Narasi Audio',
    'result.video': 'Video Cerita',
    'result.download': 'Unduh Video',
    'result.again': 'Gambar Cerita Lagi!',
    'error.no_keys': 'Masukkan kunci API terlebih dahulu',
    'error.ollama': 'Gagal menghubungi Ollama. Pastikan server berjalan.',
    'error.elevenlabs': 'Gagal membuat suara. Periksa kunci API ElevenLabs.',
    'error.ffmpeg': 'Gagal membuat video.',
    'error.generic': 'Terjadi kesalahan. Coba lagi.'
  };

  strings.en = {
    'app.title': 'Magic Story Engine',
    'app.subtitle': 'Draw a picture, get a story video!',
    'step.draw': 'Draw',
    'step.describe': 'Describe',
    'step.story': 'Story',
    'step.voice': 'Voice',
    'step.video': 'Video',
    'draw.size': 'Size',
    'draw.eraser': 'Eraser',
    'draw.clear': 'Clear',
    'draw.done': 'Done! Create My Story',
    'api.title': 'Setup API Keys',
    'api.hint': 'Enter your API keys. Keys are stored locally only.',
    'api.elevenlabs': 'ElevenLabs API Key',
    'api.ollama_model': 'Vision Model',
    'api.text_model': 'Text Model',
    'api.save': 'Save & Start',
    'proc.looking': 'AI is looking at your drawing...',
    'proc.writing': 'AI is writing your story...',
    'proc.speaking': 'AI is creating the voice...',
    'proc.rendering': 'Creating your story video...',
    'result.title': 'Your Magic Story is Ready!',
    'result.drawing': 'Your Drawing',
    'result.description': 'AI Description',
    'result.story': 'Story',
    'result.audio': 'Audio Narration',
    'result.video': 'Story Video',
    'result.download': 'Download Video',
    'result.again': 'Draw Another Story!',
    'error.no_keys': 'Please enter API keys first',
    'error.ollama': 'Failed to reach Ollama. Make sure the server is running.',
    'error.elevenlabs': 'Failed to create voice. Check your ElevenLabs API key.',
    'error.ffmpeg': 'Failed to create video.',
    'error.generic': 'Something went wrong. Please try again.'
  };

  strings['zh-TW'] = {
    'app.title': '魔法故事引擎',
    'app.subtitle': '畫一幅畫，獲得故事影片！',
    'step.draw': '畫畫',
    'step.describe': '描述',
    'step.story': '故事',
    'step.voice': '聲音',
    'step.video': '影片',
    'draw.size': '大小',
    'draw.eraser': '橡皮擦',
    'draw.clear': '清除',
    'draw.done': '完成！創造我的故事',
    'api.title': '設定 API 金鑰',
    'api.hint': '輸入您的 API 金鑰。金鑰僅儲存在本機。',
    'api.elevenlabs': 'ElevenLabs API 金鑰',
    'api.ollama_model': '視覺模型',
    'api.text_model': '文字模型',
    'api.save': '儲存並開始',
    'proc.looking': 'AI 正在看你的畫...',
    'proc.writing': 'AI 正在寫你的故事...',
    'proc.speaking': 'AI 正在創造聲音...',
    'proc.rendering': '正在創造故事影片...',
    'result.title': '你的魔法故事完成了！',
    'result.drawing': '你的畫',
    'result.description': 'AI 描述',
    'result.story': '故事',
    'result.audio': '語音朗讀',
    'result.video': '故事影片',
    'result.download': '下載影片',
    'result.again': '再畫一個故事！',
    'error.no_keys': '請先輸入 API 金鑰',
    'error.ollama': '無法連接 Ollama。請確保伺服器正在運行。',
    'error.elevenlabs': '語音建立失敗。請檢查 ElevenLabs API 金鑰。',
    'error.ffmpeg': '影片建立失敗。',
    'error.generic': '發生錯誤，請重試。'
  };

  let lang = localStorage.getItem('mse_lang') || 'id';

  function t(key) {
    return strings[lang]?.[key] || strings.en[key] || key;
  }

  function setLang(newLang) {
    lang = newLang;
    localStorage.setItem('mse_lang', lang);
    apply();
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const txt = t(key);
      if (txt !== key) el.textContent = txt;
    });
  }

  function getLang() { return lang; }

  return { t, setLang, apply, getLang };
})();