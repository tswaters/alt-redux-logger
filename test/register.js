
require('@babel/register')({
  ignore: [],
  only: [
    'test',
    'src',
    'node_modules/tiny-ansi-colors',
    'node_modules/@tswaters/tiny-diff'
  ],
  extensions: ['.js', '.mjs', '.jsx']
})

require('./setup-browser')
