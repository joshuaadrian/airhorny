require('dotenv').config();

let mix                  = require('laravel-mix');
let webpack              = require('webpack');
let path                 = require('path');
let productionSourceMaps = false;

const domain    = 'airhorny.test';

mix.setPublicPath('dist');
mix.setResourceRoot('/');

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
    '**/*.html',
    'dist/**/*.css',
    'dist/**/*.js'
  ],
  notify: false
})
.copyDirectory('assets/images', 'dist/images')
.sourceMaps()
.options({
  processCssUrls : false,
  purifyCss      : false,
  uglify         : {},
  postCss: [
    require('autoprefixer'),
  ]
});
