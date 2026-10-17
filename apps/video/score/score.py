"""
The launch film's score: an original, synthesised soundtrack timed to the
film's frames. A music bed (pad, sub, kick, hats) in A minor at 112.5 BPM,
which is exactly 16 frames a beat at 30 fps, plus sound design on the cues:
the cover's hinge, the switch, each lamp's relay, the counter's ratchet,
the flaps, the title's impact and the typing.

    python3 score/score.py            # writes public/score.wav
    ffmpeg -i public/score.wav -b:a 192k public/score.mp3 && rm public/score.wav

Keep SCENES in step with the timeline in src/Launch.tsx.
"""
import os

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48_000
FPS = 30
rng = np.random.default_rng(7)

# Scene lengths in frames and their overlap, as in src/Launch.tsx.
SCENES = [78, 96, 150, 135, 150, 120, 135, 180, 126, 108]
OVERLAP = 8
starts, t = [], 0
for length in SCENES:
    starts.append(t)
    t += length - OVERLAP
TOTAL = t + OVERLAP
FLAT, LIGHTS, GUARDED, LAMPS, FADERS, COST, BOARD, WALL, INSTALL, END = starts

N = int(TOTAL / FPS * SR) + SR  # a second of tail
mix = {name: np.zeros((N, 2)) for name in ["pad", "bass", "drums", "fx"]}


def at(frame):
    return int(frame / FPS * SR)


def secs(s):
    return int(s * SR)


def env(n, a=0.005, d=0.1, s=0.0, r=0.05, sus_len=None):
    """Attack, decay to sustain, hold, release; lengths in seconds."""
    a_n, d_n, r_n = secs(a), secs(d), secs(r)
    hold = n - a_n - d_n - r_n if sus_len is None else secs(sus_len)
    hold = max(hold, 0)
    e = np.concatenate([
        np.linspace(0, 1, a_n, endpoint=False),
        np.linspace(1, s, d_n, endpoint=False),
        np.full(hold, s),
        np.linspace(s, 0, r_n),
    ])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def lowpass(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def highpass(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bandpass(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def add(bus, start, x, gain=1.0, pan=0.0):
    """Place a mono or stereo signal on a bus at a sample offset, with pan -1..1."""
    if x.ndim == 1:
        left, right = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
        x = np.stack([x * left, x * right], axis=1)
    end = min(start + len(x), N)
    if start < N:
        mix[bus][start:end] += x[: end - start] * gain


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def saw(freq, n, detune=0.0):
    ph = np.cumsum(np.full(n, freq * (1 + detune) / SR))
    return 2 * (ph % 1) - 1


def sine(freq, n, phase=0.0):
    return np.sin(2 * np.pi * freq * np.arange(n) / SR + phase)


# ---- Harmony: Am, F, C, G, one chord a bar (4 beats = 64 frames) --------
BEAT = 16  # frames
BAR = BEAT * 4
CHORDS = [
    [57, 60, 64, 71],  # Am(add9-ish): A C E B
    [53, 57, 60, 64],  # Fmaj7: F A C E
    [48, 55, 60, 64],  # C: C G C E
    [55, 59, 62, 69],  # G(add9-ish): G B D A
]
ROOTS = [33, 29, 36, 31]  # A1 F1 C2 G1


def chord_at(frame):
    i = max(0, (frame - GUARDED) // BAR) % 4
    return CHORDS[i], ROOTS[i]


def pad(start, frames, notes, gain=0.16, attack=1.2, cutoff=1800):
    n = at(frames)
    sig = np.zeros(n)
    for m in notes:
        for d in (-0.004, 0.0, 0.0045):
            sig += saw(note(m), n, d)
    sig = lowpass(sig / (len(notes) * 3), cutoff, 2)
    e = env(n, a=attack, d=0.4, s=0.8, r=min(1.5, frames / FPS * 0.4))
    sig = sig * e
    # A little width: the right channel a few ms late.
    delay = secs(0.011)
    right = np.concatenate([np.zeros(delay), sig[:-delay]])
    add("pad", at(start), np.stack([sig, right], axis=1), gain)


def kick(start, gain=0.9):
    n = secs(0.42)
    t = np.arange(n) / SR
    freq = 46 + 95 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 7.5)
    click = highpass(rng.standard_normal(n), 2500) * np.exp(-t * 180) * 0.25
    add("drums", at(start), body + click, gain)


def hat(start, gain=0.12, length=0.05):
    n = secs(length)
    x = highpass(rng.standard_normal(n), 7000, 4) * np.exp(-np.arange(n) / SR * 70)
    add("drums", at(start), x, gain, pan=0.25)


def snap(start, gain=0.22):
    n = secs(0.18)
    t = np.arange(n) / SR
    x = bandpass(rng.standard_normal(n), 1200, 5200) * np.exp(-t * 26)
    add("drums", at(start), x, gain, pan=-0.1)


def sub(start, frames, midi, gain=0.34):
    n = at(frames)
    x = sine(note(midi), n) + 0.25 * sine(note(midi + 12), n)
    add("bass", at(start), x * env(n, a=0.01, d=0.15, s=0.7, r=0.08), gain)


# ---- Sound design -------------------------------------------------------
def tick(start, gain=0.25, tone=3500, length=0.02, pan=0.0):
    n = secs(length)
    x = bandpass(rng.standard_normal(n), tone * 0.6, min(tone * 1.6, 20000)) * np.exp(-np.arange(n) / SR * 260)
    add("fx", at(start), x, gain, pan)


def thump(start, gain=0.5, freq=70):
    n = secs(0.25)
    t = np.arange(n) / SR
    add("fx", at(start), np.sin(2 * np.pi * freq * t) * np.exp(-t * 16), gain)


def bell(start, midi, gain=0.18, pan=0.0):
    n = secs(1.6)
    t = np.arange(n) / SR
    f = note(midi)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)) * np.exp(-t * 3.2)
    add("fx", at(start), x, gain, pan)


def whoosh(start, frames, lo=400, hi=4000, gain=0.12):
    n = at(frames)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    chunk = secs(0.01)
    for i in range(0, n, chunk):
        k = i / n
        f = lo * (hi / lo) ** k
        seg = noise[i : i + chunk]
        out[i : i + chunk] = bandpass(seg, f * 0.7, min(f * 1.4, 20000), 1)
    out *= np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    add("fx", at(start), out, gain)


def impact(start, gain=0.9):
    n = secs(3.0)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    crash = lowpass(rng.standard_normal(n), 6000) * np.exp(-t * 2.8) * 0.35
    add("fx", at(start), boom + crash, gain)


# ---- Arrangement --------------------------------------------------------
# 1. Dark: a low drone under "Software went flat."
n = at(LIGHTS + 20)
drone = (sine(note(33), n) + 0.5 * sine(note(45), n)) * env(n, a=1.0, d=0.1, s=1.0, r=0.6)
drone += lowpass(rng.standard_normal(n), 300) * 0.25 * env(n, a=1.5, d=0.1, s=1.0, r=0.6)
add("pad", 0, drone, 0.12)

# 2. Lights up: a rising sweep, then the first chord blooms.
whoosh(LIGHTS - 4, 30, 200, 6000, 0.08)
pad(LIGHTS + 20, GUARDED - LIGHTS - 4, CHORDS[0], gain=0.3, attack=0.6)

# 3–7. The groove, from the guarded switch until the wall.
groove_end = WALL + 32
for f in range(GUARDED, groove_end, BAR):
    notes, root = chord_at(f)
    pad(f, BAR + 8, notes, gain=0.14, attack=0.25, cutoff=1500 + 900 * min(1, (f - GUARDED) / 500))
for f in range(GUARDED, groove_end, BEAT):
    beat = (f - GUARDED) // BEAT
    _, root = chord_at(f)
    kick(f, 0.62 if beat % 4 == 0 else 0.5)
    sub(f, BEAT - 2, root + 12, 0.28)
    if f >= LAMPS:
        hat(f + BEAT // 2, 0.09)
    if f >= FADERS and beat % 2 == 1:
        snap(f, 0.16)

# Guarded switch: the hinge, the latch, the switch going over.
whoosh(GUARDED + 30, 26, 300, 2500, 0.10)
tick(GUARDED + 56, 0.30, 2000, 0.03)
tick(GUARDED + 84, 0.45, 3000, 0.025)
thump(GUARDED + 84, 0.45, 80)

# Annunciator: a relay and a bell for each lamp, rising up the scale.
for i, f in enumerate([22, 34, 46, 58, 70]):
    tick(LAMPS + f, 0.35, 4200, 0.015, pan=-0.3 + 0.15 * i)
    bell(LAMPS + f, [69, 72, 76, 79, 81][i], 0.12, pan=-0.3 + 0.15 * i)

# Faders: a soft motor whir while the lead rides them, a thump when you grab one.
n = at(150)
motor = lowpass(saw(92, n) + saw(93.1, n), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.4 * np.arange(n) / SR))
add("fx", at(FADERS), motor * env(n, a=0.4, d=0.1, s=1.0, r=0.4), 0.05)
thump(FADERS + 78, 0.5, 65)
tick(FADERS + 78, 0.25, 1500, 0.03)

# Number wheels: a ratchet tick each time the cents turn over.
last = None
for f in range(10, 97):
    x = (f - 10) / 86
    cents = round(4.27 * (1 - (1 - x) ** 2.4) * 100)
    if cents != last:
        tick(COST + f, 0.12, 5000 + rng.uniform(-600, 600), 0.012, pan=rng.uniform(-0.2, 0.2))
        last = cents

# Split-flap: the flaps clatter as each column turns.
for row, start in enumerate([20, 34, 48, 62]):
    for col in range(8):
        tick(BOARD + start + col * 2, 0.16, 2600 + rng.uniform(-400, 400), 0.02, pan=-0.4 + 0.1 * col)

# Wall: everything drops out, a riser, then the name lands.
whoosh(WALL + 30, 26, 300, 9000, 0.13)
impact(WALL + 56, 0.85)
pad(WALL + 56, INSTALL - WALL - 40, [45, 57, 64, 67, 71, 76], gain=0.16, attack=0.08, cutoff=3200)
for f in range(WALL + 56 + BAR, INSTALL + 8, BEAT):
    hat(f + BEAT // 2, 0.07)
    kick(f, 0.4)

# Install: keys under the typing, over a quiet pad.
pad(INSTALL, END - INSTALL + 8, [53, 57, 60, 64], gain=0.22, attack=0.4, cutoff=1600)
for i in range(41):
    tick(INSTALL + 24 + int(i * 1.2), 0.14, 3200 + rng.uniform(-900, 900), 0.018, pan=rng.uniform(-0.15, 0.15))

# End: the last chord blooms and rings out.
pad(END, TOTAL - END + 30, [45, 52, 57, 60, 64, 71], gain=0.34, attack=0.3, cutoff=2600)
bell(END + 6, 81, 0.12)
bell(END + 14, 76, 0.1, pan=0.2)

# ---- Mix ----------------------------------------------------------------
def reverb(x, length=2.2, mix_amount=0.25):
    n = secs(length)
    ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR * 3.2)[:, None]
    ir[:, 1] = np.roll(ir[:, 1], 137)
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    wet /= np.max(np.abs(wet)) + 1e-9
    return x + wet * mix_amount * np.max(np.abs(x))


out = (
    reverb(mix["pad"], 2.6, 0.35) * 1.0
    + mix["bass"] * 0.9
    + reverb(mix["drums"], 0.8, 0.08) * 0.8
    + reverb(mix["fx"], 1.6, 0.18) * 0.9
)
out = out[: at(TOTAL)]
# Fade the very end, then glue and limit.
fade = at(36)
out[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
out = np.tanh(out * 1.4) / np.tanh(1.4)
out *= 0.89 / np.max(np.abs(out))

path = os.path.join(os.path.dirname(__file__), "..", "public", "score.wav")
pcm = (out * 32767).astype("<i2")
import wave

with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {os.path.normpath(path)}: {len(out) / SR:.2f}s for {TOTAL} frames")
