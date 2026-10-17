"""
The launch film's score: an original, synthesised soundtrack read from the
same cue sheet as the film (src/film/cues.json), so every hit lands on its
frame. A minor at 112.5 BPM, which is exactly 16 frames a beat at 30 fps:
a cold open of hits in the dark, a drop when the lights come up, a groove
with a sixteenth-note arpeggio and side-chained pads, a double-time
montage, a breakdown under the typing, and a last chord.

    python3 score/score.py            # writes public/score.wav
    ffmpeg -i public/score.wav -b:a 192k public/score.mp3 && rm public/score.wav

Cues come from src/film/cues.json; edit timing there, not here.
"""
import os

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48_000
FPS = 30
rng = np.random.default_rng(7)

import json

CUES = json.load(open(os.path.join(os.path.dirname(__file__), "..", "src", "film", "cues.json")))
SC, EV = CUES["scenes"], CUES["events"]
BEAT = CUES["beat"]
BAR = BEAT * 4
TOTAL = SC["end"][1]

N = int(TOTAL / FPS * SR) + SR  # a second of tail
mix = {name: np.zeros((N, 2)) for name in ["pad", "bass", "drums", "arp", "fx"]}
# Side-chain: the pad and arp duck under every kick.
duck = np.ones(N)


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


# ---- Harmony: Am, F, C, G, a bar each, from the lights coming up -------
CHORDS = [
    [57, 60, 64, 71],  # Am(add9)
    [53, 57, 60, 64],  # Fmaj7
    [48, 55, 60, 64],  # C
    [55, 59, 62, 69],  # G(add9)
]
ROOTS = [33, 29, 36, 31]
GRID = EV["lightsOn"]  # the first downbeat of the groove


def chord_at(frame):
    i = max(0, (frame - GRID) // BAR) % 4
    return CHORDS[i], ROOTS[i]


def pad(start, frames, notes, gain=0.16, attack=1.2, cutoff=1800):
    n = at(frames)
    sig = np.zeros(n)
    for m in notes:
        for d in (-0.004, 0.0, 0.0045):
            sig += saw(note(m), n, d)
    sig = lowpass(sig / (len(notes) * 3), cutoff, 2)
    sig = sig * env(n, a=attack, d=0.4, s=0.8, r=min(1.5, frames / FPS * 0.4))
    delay = secs(0.011)
    right = np.concatenate([np.zeros(delay), sig[:-delay]])
    add("pad", at(start), np.stack([sig, right], axis=1), gain)


def kick(start, gain=0.9, sidechain=True):
    n = secs(0.42)
    t = np.arange(n) / SR
    freq = 46 + 95 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 7.5)
    click = highpass(rng.standard_normal(n), 2500) * np.exp(-t * 180) * 0.25
    add("drums", at(start), body + click, gain)
    if sidechain:
        i = at(start)
        d = secs(0.3)
        curve = 1 - 0.65 * np.exp(-np.arange(d) / SR * 9)
        duck[i : i + d] = np.minimum(duck[i : i + d], curve[: max(0, min(d, N - i))])


def hat(start, gain=0.12, length=0.05, pan=0.25):
    n = secs(length)
    x = highpass(rng.standard_normal(n), 7000, 4) * np.exp(-np.arange(n) / SR * 70)
    add("drums", at(start), x, gain, pan=pan)


def snap(start, gain=0.22):
    n = secs(0.18)
    t = np.arange(n) / SR
    x = bandpass(rng.standard_normal(n), 1200, 5200) * np.exp(-t * 26)
    add("drums", at(start), x, gain, pan=-0.1)


def sub(start, frames, midi, gain=0.34):
    n = at(frames)
    x = sine(note(midi), n) + 0.25 * sine(note(midi + 12), n)
    add("bass", at(start), x * env(n, a=0.01, d=0.15, s=0.7, r=0.08), gain)


def pluck(start, midi, gain=0.1, pan=0.0, bright=3200):
    n = secs(0.32)
    t = np.arange(n) / SR
    x = saw(note(midi), n, 0.002) + 0.6 * saw(note(midi), n, -0.003)
    x = lowpass(x, bright, 2) * np.exp(-t * 11)
    add("arp", at(start), x, gain, pan)


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
cold0, cold1 = SC["cold"]

# 1. Cold open: a low pulse in the dark; a hit on every word, a swish on every macro.
n = at(cold1 + 8)
drone = (sine(note(33), n) + 0.5 * sine(note(45), n)) * env(n, a=0.8, d=0.1, s=1.0, r=0.3)
drone *= 0.75 + 0.25 * np.sin(2 * np.pi * (112.5 / 60) * np.arange(n) / SR) ** 2
add("pad", 0, drone, 0.1)
for i, f in enumerate(EV["coldWords"]):
    thump(f, 0.55, 48 + i * 3)
    tick(f, 0.22, 1800, 0.03)
    add("fx", at(f), lowpass(rng.standard_normal(secs(0.6)), 900) * np.exp(-np.arange(secs(0.6)) / SR * 6), 0.12)
for f in EV["coldMacros"]:
    whoosh(f - 2, 14, 600, 7000, 0.10)
    tick(f + 2, 0.18, 4500, 0.012)
# The last word holds; a riser into the reveal.
whoosh(cold1 - 28, 34, 150, 9000, 0.16)

# 2. Reveal: silence, the lever throws in the dark, then the lights come up on the drop.
tick(EV["leverFlip"], 0.5, 2800, 0.03)
thump(EV["leverFlip"], 0.5, 75)
impact(EV["lightsOn"], 0.8)
pad(EV["lightsOn"], SC["reveal"][1] - EV["lightsOn"] + 8, [45, 57, 64, 67, 71, 76], gain=0.2, attack=0.05, cutoff=3400)
bell(EV["titleLands"], 81, 0.14)
bell(EV["titleLands"] + 4, 88, 0.08, pan=0.3)
for f in range(EV["lightsOn"], SC["reveal"][1], BEAT):
    kick(f, 0.45)
    sub(f, BEAT - 2, 45, 0.22)

# 3–8. The groove: switch, lamps, mixer, controls, records, then the montage and the demos.
groove0, groove1 = SC["switch"][0], SC["install"][0]
for f in range(groove0, groove1, BAR):
    notes, root = chord_at(f)
    pad(f, BAR + 6, notes, gain=0.15, attack=0.12, cutoff=1500 + 1700 * min(1, (f - groove0) / 640))
arp_shape = [0, 1, 2, 3, 2, 1, 2, 3]
for f in range(groove0, groove1, BEAT):
    beat = (f - groove0) // BEAT
    notes, root = chord_at(f)
    montage = SC["montage"][0] <= f < SC["montage"][1]
    kick(f, 0.62 if beat % 4 == 0 else 0.52)
    sub(f, BEAT // 2 - 1, root + 12, 0.27)
    sub(f + BEAT // 2, BEAT // 2 - 1, root + 12, 0.2)
    hat(f + BEAT // 2, 0.1)
    if montage:
        hat(f + BEAT // 4, 0.07, pan=-0.25)
        hat(f + 3 * BEAT // 4, 0.07, pan=-0.25)
    if beat % 2 == 1:
        snap(f, 0.17)
    # The arpeggio comes in with the lamps and opens up as the film goes on.
    if f >= SC["lamps"][0]:
        for k in range(4):
            m = notes[arp_shape[(beat * 4 + k) % 8]] + 12
            bright = 1800 + 3600 * min(1, (f - SC["lamps"][0]) / 512)
            pluck(f + k * BEAT // 4, m, 0.07 if k else 0.09, pan=(-0.35, 0.35)[k % 2], bright=bright)

# Guarded switch: Lift, Flip, Ship.
whoosh(EV["coverLift"] - 2, 14, 300, 2600, 0.12)
tick(EV["coverLift"] + 10, 0.3, 2000, 0.03)
tick(EV["switchFlip"], 0.5, 3000, 0.025)
thump(EV["switchFlip"], 0.55, 80)
impact(EV["ship"], 0.35)

# Lamps: a relay and a bell for each, flicker ticks on the eighths until acknowledged.
for i, f in enumerate(EV["lamps"]):
    tick(f, 0.35, 4200, 0.015, pan=-0.3 + 0.15 * i)
    bell(f, [69, 72, 76, 79, 81][i], 0.12, pan=-0.3 + 0.15 * i)
for f in range(EV["lamps"][0], EV["acknowledge"], BEAT // 2):
    tick(f, 0.06, 6000, 0.008, pan=0.4)
thump(EV["acknowledge"], 0.5, 70)
tick(EV["acknowledge"], 0.3, 2500, 0.02)

# Mixer: a motor under the faders, a thump when you take one.
n = at(SC["mixer"][1] - SC["mixer"][0])
motor = lowpass(saw(92, n) + saw(93.1, n), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * (112.5 / 60 / 2) * np.arange(n) / SR))
add("fx", at(SC["mixer"][0]), motor * env(n, a=0.3, d=0.1, s=1.0, r=0.3), 0.045)
thump(EV["faderGrab"], 0.55, 65)
whoosh(EV["faderGrab"], 10, 400, 3000, 0.08)

# Controls: detent clicks, the telegraph's bell for the order and the answer.
for f in EV["knobClicks"]:
    tick(f, 0.3, 3600, 0.012, pan=-0.4)
    tick(f + 1, 0.12, 2200, 0.01, pan=-0.4)
bell(EV["telegraphOrder"], 76, 0.14)
bell(EV["telegraphOrder"] + 5, 76, 0.1)
bell(EV["telegraphAnswer"], 76, 0.12, pan=0.2)
bell(EV["telegraphAnswer"] + 5, 76, 0.09, pan=0.2)

# Records: flaps clatter row by row; the grease pencil scribbles.
for row, start in enumerate(EV["flapRows"]):
    for col in range(8):
        tick(start + col * 2, 0.15, 2600 + rng.uniform(-400, 400), 0.02, pan=-0.5 + 0.06 * col)
for f in EV["pencilMarks"]:
    n = secs(0.26)
    scribble = bandpass(rng.standard_normal(n), 1800, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * np.arange(n) / SR)) * env(n, a=0.02, d=0.05, s=0.8, r=0.1)
    add("fx", at(f), scribble, 0.1, pan=0.4)

# Montage: a swish on every cut.
for f in range(SC["montage"][0], SC["montage"][1], EV["montageCuts"]):
    whoosh(f - 3, 7, 1200, 9000, 0.06)

# Demos: the windows fly off on the beat.
for f in EV["demoFlips"]:
    whoosh(f - 4, 16, 300, 5000, 0.12)

# Install: a breakdown under the typing, a riser, then everything back on Enter.
i0 = SC["install"][0]
pad(i0, EV["enter"] - i0 + 4, [53, 57, 60, 64], gain=0.2, attack=0.3, cutoff=1300)
k = 0
while EV["typingStart"] + k * EV["typingStep"] < EV["typingStart"] + 41 * EV["typingStep"]:
    tick(int(EV["typingStart"] + k * EV["typingStep"]), 0.15, 3200 + rng.uniform(-900, 900), 0.018, pan=rng.uniform(-0.15, 0.15))
    k += 1
whoosh(EV["enter"] - 30, 30, 200, 9000, 0.14)
impact(EV["enter"], 0.7)
for f in range(EV["enter"], SC["end"][0], BEAT):
    notes, root = chord_at(f)
    kick(f, 0.55)
    sub(f, BEAT - 2, root + 12, 0.26)
    hat(f + BEAT // 2, 0.09)
pad(EV["enter"], SC["end"][0] - EV["enter"] + 6, CHORDS[0], gain=0.15, attack=0.05, cutoff=3000)

# End: the last chord, an impact, bells, and the room fading.
impact(EV["endChord"], 0.6)
pad(EV["endChord"], TOTAL - EV["endChord"] + 30, [45, 52, 57, 60, 64, 71], gain=0.3, attack=0.05, cutoff=2800)
bell(EV["endChord"] + 8, 81, 0.12)
bell(EV["endChord"] + 16, 76, 0.1, pan=0.2)
bell(EV["endChord"] + 24, 88, 0.06, pan=-0.2)

# ---- Mix ----------------------------------------------------------------
def reverb(x, length=2.2, mix_amount=0.25):
    n = secs(length)
    ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR * 3.2)[:, None]
    ir[:, 1] = np.roll(ir[:, 1], 137)
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    wet /= np.max(np.abs(wet)) + 1e-9
    return x + wet * mix_amount * np.max(np.abs(x))


out = (
    reverb(mix["pad"], 2.6, 0.35) * duck[:, None]
    + reverb(mix["arp"], 1.4, 0.3) * (0.4 + 0.6 * duck[:, None])
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
