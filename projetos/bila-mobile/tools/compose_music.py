#!/usr/bin/env python3
"""Compose the original Good Bila chiptune loop. No external samples."""
from pathlib import Path
import math, random, wave, array
RATE=22050
BEAT=60/104
LENGTH=32*BEAT
N=round(LENGTH*RATE)
left=[0.0]*N
right=[0.0]*N
rng=random.Random(6041)
def note(midi,start,duration,volume,voice='pluck',pan=0):
    freq=440*2**((midi-69)/12)
    start_idx=round(start*RATE)
    frames=round(duration*RATE)
    for i in range(frames):
        t=i/RATE
        envelope=min(1,t/0.008)*min(1,(duration-t)/0.035)
        phase=2*math.pi*freq*t
        if voice=='bass': sample=math.sin(phase)*0.85+math.sin(phase*2)*0.15
        elif voice=='lead': sample=math.sin(phase)*0.72+math.sin(phase*3)*0.18+math.sin(phase*5)*0.1
        else: sample=math.sin(phase)+math.sin(phase*2)*0.18
        sample*=envelope*math.exp(-t*(3.8 if voice=='pluck' else 1.5))*volume
        j=(start_idx+i)%N
        left[j]+=sample*(1-pan)*0.5
        right[j]+=sample*(1+pan)*0.5
chords=[(57,60,64,67),(53,57,60,64),(50,53,57,60),(55,59,62,65),
        (52,55,59,62),(57,60,64,67),(50,53,57,60),(55,59,62,65)]
melodies=[(76,None,79,76,72,None,74,76),(77,None,76,72,69,None,72,76),
          (77,76,74,None,69,None,72,74),(74,None,71,74,77,None,76,74),
          (76,None,79,83,79,None,76,74),(72,None,76,79,81,79,76,None),
          (77,None,76,74,72,None,69,72),(71,74,77,None,76,74,71,None)]
for bar,chord in enumerate(chords):
    base=bar*4*BEAT
    for beat in (0,1.5,2.5):
        note(chord[0]-24,base+beat*BEAT,0.7*BEAT,0.22,'bass')
    for beat in (0.5,1.75,2.5,3.5):
        for k,midi in enumerate(chord): note(midi,base+beat*BEAT+k*0.008,0.48*BEAT,0.065,'pluck',(-0.35 if k%2 else 0.35))
    for i,midi in enumerate(melodies[bar]):
        if midi is not None: note(midi,base+i*0.5*BEAT,0.40*BEAT,0.12,'lead',0.12)
for beat in range(32):
    for i in range(round(RATE*0.14)):
        t=i/RATE
        sample=math.sin(2*math.pi*(65*t-75*t*t))*math.exp(-t*28)*0.16
        j=(round(beat*BEAT*RATE)+i)%N
        left[j]+=sample;right[j]+=sample
    for half in (0,0.5):
        for i in range(round(RATE*0.045)):
            t=i/RATE
            sample=rng.uniform(-1,1)*math.exp(-t*95)*0.025
            j=(round((beat+half)*BEAT*RATE)+i)%N
            left[j]+=sample*0.7;right[j]+=sample
    if beat%4 in (1,3):
        for i in range(round(RATE*0.10)):
            t=i/RATE
            sample=rng.uniform(-1,1)*math.exp(-t*42)*0.06
            j=(round(beat*BEAT*RATE)+i)%N
            left[j]+=sample;right[j]+=sample*0.8
peak=max(max(abs(x) for x in left),max(abs(x) for x in right))
pcm=array.array('h')
for a,b in zip(left,right):
    pcm.append(round(a/peak*0.72*32767));pcm.append(round(b/peak*0.72*32767))
out=Path(__file__).resolve().parents[1]/'assets/quintal-loop.wav'
with wave.open(str(out),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(pcm.tobytes())
print(f'Original loop: {LENGTH:.2f}s, {RATE}Hz stereo, {out}')
