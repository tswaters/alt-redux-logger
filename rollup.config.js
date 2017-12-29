
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

const config = (browser, minify) => {

  const babel_plugins = []
  if (browser) {
    babel_plugins.push(
      'transform-es3-property-literals',
      'transform-es3-member-expression-literals'
    )
  }

  const external = []

  const plugins = [
    babel({
      plugins: babel_plugins,
      presets: [
        ['@babel/preset-env', {
          loose: true,
          modules: false,
          targets: browser
            ? {browsers: ['ie >= 8']}
            : {node: '4'}
        }]
      ]
    }),

  ]

  if (browser) {
    plugins.push(
      resolve({
        extensions: ['.js', '.mjs']
      })
    )
  } else {
    external.push(
      'tiny-ansi-colors/es',
      '@tswaters/tiny-diff/es'
    )
  }

  if (minify) {
    plugins.push(uglify())
  }

  return {
    input: './src/index.js',
    output: browser ? {
      file: `dist/alt-redux-logger.umd${minify ? '.min' : ''}.js`,
      name: 'altReduxLogger',
      format: 'umd',
      amd: {id: 'altReduxLogger'}
    } : [{
      file: './es/index.mjs',
      format: 'es'
    }, {
      file: './dist/alt-redux-logger.js',
      format: 'cjs'
    }],
    plugins,
    external
  }

}

export default [
  config(true, false),  // browser.unmin
  config(true, true),   // browser.min
  config(false)         // nodejs (es, cjs)
]
