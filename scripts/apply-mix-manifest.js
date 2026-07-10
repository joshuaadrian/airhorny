const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'dist/mix-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('apply-mix-manifest: dist/mix-manifest.json not found. Run the Mix build first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function versionedRelativeUrl(manifestValue) {
  return './dist' + manifestValue;
}

function versionedAbsoluteUrl(manifestValue) {
  return '/dist' + manifestValue;
}

function applyManifest(content, prefix) {
  var updated = content;

  Object.keys(manifest).forEach(function (key) {
    var versioned = manifest[key];
    var base = prefix + key;
    var next = prefix === './dist' ? versionedRelativeUrl(versioned) : versionedAbsoluteUrl(versioned);
    var pattern = new RegExp(escapeRegex(base) + '(\\?[^"\'\\s]*)?', 'g');

    updated = updated.replace(pattern, next);
  });

  return updated;
}

function writeIfChanged(filePath, content) {
  var previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';

  if (previous !== content) {
    fs.writeFileSync(filePath, content);
    console.log('apply-mix-manifest: updated ' + path.relative(root, filePath));
  }
}

var files = [
  { path: path.join(root, 'index.html'), prefix: './dist' },
  { path: path.join(root, 'sw.js'), prefix: '/dist' },
  { path: path.join(root, 'dist/scripts/app.js'), prefix: '/dist' },
];

files.forEach(function (file) {
  if (!fs.existsSync(file.path)) {
    return;
  }

  var content = fs.readFileSync(file.path, 'utf8');
  writeIfChanged(file.path, applyManifest(content, file.prefix));
});
