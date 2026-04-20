const Pipeline = (() => {
  const WEBHOOK_URL = 'https://n8n.rayantion.me/webhook/magic-story';

  async function process(imageBase64, language) {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64, language: language })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('Pipeline error ' + response.status + ': ' + errText);
    }

    const data = await response.json();

    if (!data.description && !data.story && !data.audio) {
      throw new Error('No data returned from pipeline');
    }

    let audioBlob = null;
    if (data.audio) {
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
    }

    return {
      description: data.description || '',
      story: data.story || '',
      audioBlob: audioBlob
    };
  }

  return { process: process };
})();