const regl = require('regl')({
  attributes: {
    preserveDrawingBuffer: true
  }
})

const drawPitch = regl({
  vert: `
  precision highp float;
  attribute float pitch;
  uniform float column;
  void main () {
    gl_PointSize = 8.0;
    gl_Position = vec4(column, pitch / 5000.0 - 0.9,  0, 1);
  }
  `,

  frag: `
  void main () {
    gl_FragColor = vec4(1, 1, 1, 1);
  }
  `,

  attributes: {
    pitch: regl.context('pitches')
  },

  uniforms: {
    column: ({tick, viewportWidth}) => 2.0 * (tick % viewportWidth) / viewportWidth - 1.0
  },

  count: 1,
  depth: {enable: false},
  primitive: 'points'
})

require('../microphone')({
  regl,
  beats: 0,
  pitches: 4,
  name: '',
  done: (microphone) => {
    regl.clear({
      color: [0, 0, 0, 1]
    })
    regl.frame(() => {
      microphone(({pitches}) => {
        drawPitch()
      })
    })
  }
})
