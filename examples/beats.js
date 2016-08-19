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

require('../microphone')({
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
