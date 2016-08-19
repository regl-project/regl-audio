const regl = require('regl')()

const drawCepstrum = regl({
  vert: `
  precision highp float;

  attribute float cep, que;

  void main () {
    gl_Position = vec4(cep, que, 0, 1);
  }
  `,

  frag: `
  void main () {
    gl_FragColor = vec4(1, 1, 1, 1);
  }
  `,

  attributes: {
    cep: Array(512).fill(0).map((_, i) => i / 256 - 1.0),
    que: ({cepstrum}) => new Float32Array(cepstrum)
  },

  count: ({sampleCount}) => sampleCount / 2,
  primitive: 'line strip'
})

require('../microphone')({
  regl,
  beats: 16,
  name: '',
  done: (microphone) => {
    regl.frame(() => {
      microphone(({beats}) => {
        regl.clear({
          color: [0, 0, 0, 1]
        })
        drawCepstrum()
      })
    })
  }
})
