let mix = require('laravel-mix');

const homedir = require('os').homedir();
const domain    = 'airhorny.test';

mix.setPublicPath('dist');
mix.setResourceRoot('/');

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
.version()
.browserSync({
  proxy : 'airhorny.test',
  files : [
    '**/*.html',
    'dist/**/*.css',
    'assets/**/*.js'
  ]
})
.copyDirectory('assets/images/', 'dist/images')
.copyDirectory('assets/fonts/', 'dist/fonts')
.copyDirectory('assets/sounds/', 'dist/sounds')
.sourceMaps()
.options({
  processCssUrls : false,
  purifyCss      : false,
  uglify         : {}
});
