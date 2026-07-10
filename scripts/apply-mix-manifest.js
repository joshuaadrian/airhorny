const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'dist/mix-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('apply-mix-manifest: dist/mix-manifest.json not found. Run the Mix build first.');
  process.exit(1);
}

const mixManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripQuery(value) {
  return value.split('?')[0];
}

function hashFile(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

function distFilePath(manifestKey) {
  return path.join(root, 'dist', stripQuery(manifestKey).replace(/^\//, ''));
}

function versionedRelativeUrl(manifestValue) {
  return './dist' + manifestValue;
}

function versionedAbsoluteUrl(manifestValue) {
  return '/dist' + manifestValue;
}

function applyManifest(content, prefix, manifest) {
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

var manifestKeys = Object.keys(mixManifest).map(stripQuery).filter(function (key, index, keys) {
  return keys.indexOf(key) === index;
});

var manifest = {};
var appJsKey = '/scripts/app.js';
var appJsPath = distFilePath(appJsKey);

manifestKeys.forEach(function (key) {
  if (key === appJsKey) {
    return;
  }

  var filePath = distFilePath(key);

  if (!fs.existsSync(filePath)) {
    console.warn('apply-mix-manifest: missing ' + key);
    return;
  }

  manifest[key] = key + '?id=' + hashFile(filePath);
});

if (fs.existsSync(appJsPath)) {
  var appJs = fs.readFileSync(appJsPath, 'utf8');
  appJs = applyManifest(appJs, '/dist', manifest);
  writeIfChanged(appJsPath, appJs);
  manifest[appJsKey] = appJsKey + '?id=' + hashFile(appJsPath);
}

writeIfChanged(manifestPath, JSON.stringify(manifest, null, 4) + '\n');

[
  { path: path.join(root, 'index.html'), prefix: './dist' },
  { path: path.join(root, 'sw.js'), prefix: '/dist' },
].forEach(function (file) {
  if (!fs.existsSync(file.path)) {
    return;
  }

  var content = fs.readFileSync(file.path, 'utf8');
  writeIfChanged(file.path, applyManifest(content, file.prefix, manifest));
});
