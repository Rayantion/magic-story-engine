const OllamaAPI = (() => {
  let baseUrl = 'https://ollama.ai';
  let visionModel = 'llava';
  let textModel = 'llama3.2';

  function configure(url, vision, text) {
    baseUrl = url.replace(/\/+$/, '');
    visionModel = vision || 'llava';
    textModel = text || 'llama3.2';
  }

  async function describeDrawing(base64Image) {
    const lang = I18N.getLang();
    const langInstruction = lang === 'id' ? ' in Indonesian' : lang === 'zh-TW' ? ' in Traditional Chinese' : '';

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: visionModel,
        prompt: `Describe this drawing in detail for a children's story. What characters, animals, or objects are shown? What are they doing? What is the setting? Be specific and imaginative${langInstruction}.`,
        images: [base64Image],
        stream: false
      })
    });

    if (!response.ok) throw new Error(`Ollama vision error: ${response.status}`);
    const data = await response.json();
    return data.response || '';
  }

  async function generateStory(description) {
    const lang = I18N.getLang();
    const langInstruction = lang === 'id' ? 'Write the story in Indonesian.' : lang === 'zh-TW' ? 'Write the story in Traditional Chinese.' : 'Write the story in English.';

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: textModel,
        prompt: `Write a magical 30-second children's story (under 100 words, ages 4-8) based on this drawing description: "${description}". The story should be friendly, easy to understand, and have a happy ending. ${langInstruction}`,
        stream: false
      })
    });

    if (!response.ok) throw new Error(`Ollama text error: ${response.status}`);
    const data = await response.json();
    return data.response || '';
  }

  return { configure, describeDrawing, generateStory };
})();