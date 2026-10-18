const fs = require('fs');
const path = require('path');

const templates = [
  'head.html',
  'nav.html',
  'hero.html',
  'simulator_top.html',
  'simulator_panel1.html',
  'simulator_panel234.html',
  'compare.html',
  'features_1.html',
  'features_2.html',
  'benchmark.html',
  'download.html',
  'scripts_audio_canvas.html',
  'scripts_slider_tabs.html',
  'scripts_launch_toast.html'
];

let fullHtml = '';
for (const t of templates) {
  const filePath = path.join(__dirname, 'templates', t);
  const content = fs.readFileSync(filePath, 'utf8');
  fullHtml += content + '\n';
}

const outPath = path.join(__dirname, 'docs', 'index.html');
fs.writeFileSync(outPath, fullHtml, 'utf8');
console.log('Successfully compiled docs/index.html, total size:', fullHtml.length, 'bytes');
