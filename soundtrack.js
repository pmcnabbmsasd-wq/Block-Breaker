// Generates an original, gritty instrumental rap beat with the Web Audio API.
const musicButton = document.getElementById("music-toggle");
const musicStatus = document.getElementById("music-status");
const lyricCaption = document.getElementById("lyric-caption");
const stepLength = 0.125;
const kickSteps = [0, 6, 8, 11];
const snareSteps = [4, 12];
const bassNotes = [36, null, null, 36, null, null, 34, null, 36, null, null, 39, null, null, 34, null];
const lyricLines = [
  "My name is Roman, got jokes in the booth.",
  "Broke as a joke, but I’m finding my groove.",
  "Learning my numbers, my letters, my ABCs.",
  "Breaking those bricks like it’s easy as three."
];
const lyricCaptions = [
  "我叫 Roman，在录音棚里讲笑话。",
  "穷得像个笑话，但我正找到自己的节奏。",
  "学数字、学字母，也学我的 ABC。",
  "打碎那些砖块，轻松得像数到三。"
];

let audioContext;
let musicTimer;
let musicStep = 0;
let musicPlaying = false;
let musicLoopCount = 0;
let lyricLine = 0;
let noiseBuffer;
let distortionCurve;

function speakLyricLine() {
  const lineIndex = lyricLine;
  const utterance = new SpeechSynthesisUtterance(lyricLines[lineIndex]);
  utterance.rate = 1.18;
  utterance.pitch = 1.08;
  utterance.volume = 0.85;
  utterance.onstart = function () {
    lyricCaption.textContent = lyricCaptions[lineIndex];
  };
  window.speechSynthesis.speak(utterance);
  lyricLine = (lyricLine + 1) % lyricLines.length;
}

function makeNoiseBuffer() {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
  const samples = buffer.getChannelData(0);

  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function makeDistortionCurve() {
  const samples = 256;
  const curve = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const value = (i * 2) / samples - 1;
    curve[i] = Math.tanh(value * 4);
  }

  return curve;
}

function playNoise(time, duration, volume, frequency, resonance) {
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const envelope = audioContext.createGain();

  source.buffer = noiseBuffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(frequency, time);
  filter.Q.setValueAtTime(resonance, time);
  envelope.gain.setValueAtTime(volume, time);
  envelope.gain.exponentialRampToValueAtTime(0.001, time + duration);

  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(audioContext.destination);
  source.start(time);
  source.stop(time + duration);
}

function playKick(time) {
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  const shaper = audioContext.createWaveShaper();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(130, time);
  oscillator.frequency.exponentialRampToValueAtTime(42, time + 0.16);
  shaper.curve = distortionCurve;
  envelope.gain.setValueAtTime(0.16, time);
  envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  oscillator.connect(shaper);
  shaper.connect(envelope);
  envelope.connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.23);
}

function playBass(midiNote, time) {
  const oscillator = audioContext.createOscillator();
  const shaper = audioContext.createWaveShaper();
  const envelope = audioContext.createGain();
  const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(frequency, time);
  shaper.curve = distortionCurve;
  envelope.gain.setValueAtTime(0.045, time);
  envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.19);

  oscillator.connect(shaper);
  shaper.connect(envelope);
  envelope.connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.2);
}

function playMusicStep() {
  const time = audioContext.currentTime;

  if (musicStep === 0) {
    if (
      musicLoopCount % 2 === 0 &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined"
    ) {
      speakLyricLine();
    }
    musicLoopCount++;
  }

  if (kickSteps.includes(musicStep)) {
    playKick(time);
  }
  if (snareSteps.includes(musicStep)) {
    playNoise(time, 0.16, 0.07, 1800, 0.8);
    playNoise(time, 0.12, 0.035, 320, 0.6);
  }
  if (musicStep % 2 === 0) {
    playNoise(time, 0.045, musicStep % 4 === 2 ? 0.018 : 0.012, 7500, 0.5);
  }
  if ([3, 7, 11, 15].includes(musicStep)) {
    playNoise(time, 0.07, 0.008, 1200, 0.7);
  }

  const bassNote = bassNotes[musicStep];
  if (bassNote !== null) {
    playBass(bassNote, time);
  }

  musicStep = (musicStep + 1) % 16;
}

musicButton.addEventListener("click", async function () {
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported by this browser.");
      }
      audioContext = new AudioContextClass();
      noiseBuffer = makeNoiseBuffer();
      distortionCurve = makeDistortionCurve();
    }

    if (musicPlaying) {
      clearInterval(musicTimer);
      musicTimer = undefined;
      musicPlaying = false;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      lyricCaption.textContent = "";
      await audioContext.suspend();
      musicButton.textContent = "Play music";
      musicButton.setAttribute("aria-pressed", "false");
      musicStatus.textContent = "Music and lyrics are paused.";
      return;
    }

    await audioContext.resume();
    musicPlaying = true;
    musicButton.textContent = "Mute music";
    musicButton.setAttribute("aria-pressed", "true");
    musicStatus.textContent = "Playing the beat and spoken lyrics.";
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      musicStatus.textContent = "Playing the beat. Spoken lyrics are not supported in this browser.";
    }
    playMusicStep();
    musicTimer = setInterval(playMusicStep, stepLength * 1000);
  } catch (error) {
    console.error("Could not play the soundtrack:", error);
    musicButton.textContent = "Music unavailable";
    musicButton.disabled = true;
    musicStatus.textContent = "The soundtrack could not be played.";
  }
});
