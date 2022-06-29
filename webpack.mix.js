let mix = require('laravel-mix');

require('laravel-mix-polyfill');

mix.setPublicPath('docs/dist');
mix.setResourceRoot('/docs/dist/');

mix.webpackConfig({
    stats: {
        children: true,
    },
});

mix.autoload({
   jquery : ['$', 'window.$', 'window.jQuery']
})
.js('assets/scripts/app.js', 'scripts')
.sass('assets/styles/app.scss', 'styles')
.polyfill({
  enabled     : true,
  useBuiltIns : "usage",
  targets     : "firefox 50, IE 11"
})
.version()
.browserSync({
  proxy : 'airhorny.test/docs',
  files : [
    '**/*.html',
    'dist/**/*.css',
    'assets/**/*.js'
  ]
})
.copyDirectory('assets/images/', 'docs/dist/images')
.copyDirectory('assets/fonts/', 'docs/dist/fonts')
.sourceMaps()
.options({
  processCssUrls : false,
  purifyCss      : false,
  uglify         : {}
});
