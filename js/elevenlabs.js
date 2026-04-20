const ElevenLabsAPI = (() => {
  let apiKey = '';

  function configure(key) {
    apiKey = key;
  }

  // Rachel voice ID
  const RACHEL_VOICE_ID = '21m00Tcj4gTq2TnbjiSf';

  async function textToSpeech(text) {
    if (!apiKey) throw new Error('ElevenLabs API key not set');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${RACHEL_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`ElevenLabs error ${response.status}: ${errBody}`);
    }

    const blob = await response.blob();
    return blob;
  }

  return { configure, textToSpeech };
})();