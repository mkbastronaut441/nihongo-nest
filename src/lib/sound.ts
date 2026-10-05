/** A tiny, original Web Audio chime for learner celebrations. */
export function playCelebration() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return;
  try {
    const context = new window.AudioContext();
    const now = context.currentTime;
    [659.25, 783.99, 987.77].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.07, now + index * 0.11 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.11 + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + index * 0.11);
      oscillator.stop(now + index * 0.11 + 0.21);
    });
    window.setTimeout(() => void context.close(), 700);
  } catch {
    /* Audio is optional; celebration animation still gives feedback. */
  }
}
