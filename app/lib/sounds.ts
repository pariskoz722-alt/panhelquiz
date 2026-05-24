// Web Audio API — no external files needed
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    return ctx
  } catch { return null }
}

function tone(freq: number, dur: number, vol = 0.22, type: OscillatorType = 'sine', delay = 0) {
  const c = getCtx()
  if (!c) return
  try {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain); gain.connect(c.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime + delay)
    gain.gain.setValueAtTime(0.001, c.currentTime + delay)
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur)
    osc.start(c.currentTime + delay)
    osc.stop(c.currentTime + delay + dur + 0.05)
  } catch {}
}

export function soundsEnabled() {
  try { return localStorage.getItem('sounds') !== 'false' } catch { return true }
}

export function setSoundsEnabled(on: boolean) {
  try { localStorage.setItem('sounds', on ? 'true' : 'false') } catch {}
}

export function soundCorrect() {
  if (!soundsEnabled()) return
  tone(880, 0.1)
  tone(1100, 0.18, 0.2, 'sine', 0.09)
}

export function soundWrong() {
  if (!soundsEnabled()) return
  tone(280, 0.25, 0.25, 'sawtooth')
  tone(200, 0.2, 0.15, 'sawtooth', 0.12)
}

export function soundCountdown() {
  if (!soundsEnabled()) return
  tone(520, 0.09, 0.18)
}

export function soundGo() {
  if (!soundsEnabled()) return
  tone(660, 0.09); tone(880, 0.18, 0.28, 'sine', 0.08)
}

export function soundComplete(won?: boolean) {
  if (!soundsEnabled()) return
  if (won === false) { tone(440, 0.12); tone(330, 0.25, 0.2, 'sine', 0.15); return }
  const freqs = [523, 659, 784, 1047]
  freqs.forEach((f, i) => tone(f, 0.18, 0.2, 'sine', i * 0.09))
}
