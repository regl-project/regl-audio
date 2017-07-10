# regl-audio
Tools for working with audio in [regl](https://github.com/mikolalysenko/regl).  This module has the following components:

* An analyser
* A microphone connection

Examples:

* [Beat detection](https://regl-project.github.io/regl-audio/beats.html)
* [Cepstrum](https://regl-project.github.io/regl-audio/cepstrum.html)
* [Pitch detection](https://regl-project.github.io/regl-audio/pitch.html)

## Examples
Here is a simple beat detector:

```javascript
const regl = require('regl')()

const drawBeats = regl({
  vert: `
  precision highp float;

  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(position, 0, 1);
  }
  `,

  frag: `
  precision highp float;

  varying vec2 uv;

  uniform float beats[16];

  void main () {
    float intensity = 0.0;

    float bin = floor(8.0 * (1.0 + uv.x));

    for (int i = 0; i < 16; ++i) {
      if (abs(float(i) - bin) < 0.25) {
        intensity += step(0.25 * abs(uv.y), beats[i]);
      }
    }
    gl_FragColor = vec4(intensity, 0, 0, 1);
  }
  `,

  attributes: {
    position: [
      -4, 0,
      4, 4,
      4, -4
    ]
  },

  count: 3
})

require('regl-audio/microphone')({
  regl,
  beats: 16,
  name: '',
  done: (microphone) => {
    regl.frame(() => {
      microphone(({beats}) => {
        drawBeats()
      })
    })
  }
})
```

## regl-audio/analyser
This module takes a WebAudio analyser node and returns a scope command giving convenient access to stats from the analyser.

* PCM time domain data
* STFT frequency domain data
* Beats
* Pitch

### API

#### `const audio = require('regl-audio/analyser')(options)`
The constructor for the analyser takes the following arguments:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `regl` | A handle to a regl instance | *Required* |
| `analyser` | A WebAudio [analyser node](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) | *Required* |
| `name` | A prefix for the analyser output. | `''` |
| `sampleRate` | The sample rate of the audio source in Hz | `44100` |
| `beats` | The number of beats to detect grouped by pitch | `16` |
| `beatTime` | Duration of moving average for beats in seconds | `1` |
| `beatThreshold` | Cutoff for beat detection (must be between 0.5 and 1) | `0.8` |
| `pitches` | Number of pitches to detect | `4` |
| `maxPitch` | Maximum detectable pitch in Hz | `10000` |
| `pitchTime` | Duration of moving average for pitch in seconds | `0.25` |

#### `audio(block)`
The result is a `regl` scope command with the following properties:

| Context | Description |
|---------|-------------|
| `sampleCount` | Number of samples |
| `freq` | Array of frequencies |
| `time` | Array of PCM time samples |
| `cepstrum` | The cepstrum of the signal |
| `timeTexture` | Current time information in texture |
| `freqTexture` | Current frequency information in texture |
| `volume` | Volume of the current signal |
| `beats` | Array of detected beats sorted from low to high pitch.  Each beat is a scalar in `[0, 1]` |
| `pitches` | Array of detected pitches sorted from loudest to softest in Hz |

| Uniform | Type | Description |
|---------|------|-------------|
| `sampleCount` | `float` | Number of samples in texture |
| `time` | `sampler2D` | A sampler storing the PCM time data |
| `freq` | `sampler2D` | A sampler storing the frequency data |
| `volume` | `float` | Volume of the signal |
| `beats` | `float[NUM_PITCHES]` | An array of beats |
| `pitches` | `float[NUM_PITCHES]` | The array of detected pitches |

Note that these context variables are optionally prefixed depending on the `name` parameter.

## regl-audio/microphone
A short cut which gives you an analyser node connected to the microphone input from the computer.  Note that this must be run on a secure domain.

### API

#### `const mic = require('regl-audio/microphone')(options)`
The options are the same as above, except that it takes a webaudio context via the `options.audioContext` parameter instead of an analyser node.  By default everything is prefixed with `mic_` though this can be changed by passing some alternative to `name`.

# License
(c) 2016 Mikola Lysenko. MIT License
