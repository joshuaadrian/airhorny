require('dotenv').config();

let mix                  = require('laravel-mix');
let webpack              = require('webpack');
let path                 = require('path');
let productionSourceMaps = false;

const themename = 'airhorny';
const domain    = 'airhorny.test';
const homedir   = require('os').homedir();

mix.setPublicPath('dist');
mix.setResourceRoot(`/wp-content/themes/${themename}/dist/`);

mix.setResourceRoot('../');
mix.setPublicPath(path.resolve('./'));

mix.webpackConfig({
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ],
  watchOptions: {
    ignored: [
      path.posix.resolve(__dirname, './node_modules'),
      path.posix.resolve(__dirname, './css'),
      path.posix.resolve(__dirname, './js'),
      path.posix.resolve(__dirname, './images'),
      path.posix.resolve(__dirname, './fonts'),
    ],
  },
  stats: {
      children: true,
  },
});

mix.autoload({
   jquery : ['$', 'window.$', 'window.jQuery']
})
.setPublicPath('dist')
.js('assets/scripts/app.js', 'dist/scripts')
.sass('assets/styles/app.scss', 'dist/styles')
.version()
.browserSync({
  proxy: {
    target: 'https://' + domain
  },
  host: domain,
  open: 'external',
  https: {
    key: homedir + '/.config/valet/Certificates/' + domain + '.key',
    cert: homedir + '/.config/valet/Certificates/' + domain + '.crt',
  },
  files : [
    '**/*.php',
    'dist/**/*.css',
    'dist/**/*.js'
  ],
  notify: false
})
.copyDirectory('assets/images/', 'dist/images')
.copyDirectory('assets/fonts/', 'dist/fonts')
.copyDirectory('assets/sounds/', 'dist/sounds')
// .copy('assets/scripts/flickity.js', 'dist/scripts/flickity.js')
.sourceMaps()
.options({
  processCssUrls : false,
  purifyCss      : false,
  uglify         : {},
  postCss: [
    require('autoprefixer'),
  ]
});
