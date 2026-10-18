const fs = require('fs');
const path = require('path');

const parts = [
  require('./part_head.cjs'),
  require('./part_nav_hero.cjs'),
  require('./part_sim_sidebar.cjs'),
  require('./part_sim_content.cjs'),
  require('./part_features_top.cjs'),
  require('./part_features_bottom.cjs'),
  require('./part_compare.cjs'),
  require('./part_benchmark.cjs'),
  require('./part_download_footer.cjs'),
  require('./part_scripts.cjs')
];

const fullHtml = parts.join('\n');
const outputPath = path.join(__dirname, '..', 'docs', 'index.html');

fs.writeFileSync(outputPath, fullHtml, 'utf-8');
console.log('Successfully compiled docs/index.html! Total length:', fullHtml.length);
