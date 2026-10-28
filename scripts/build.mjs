import * as sass from 'sass';
import { writeFileSync } from 'node:fs';

// Only entrypoints are compiled. assets/extra/*.scss are imported by style.scss.
for (const source of ['style.scss', 'common/page/page.scss']) {
  const result = sass.compile(source, {
    style: 'expanded',
    charset: true,
    sourceMap: false,
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
  });
  writeFileSync(source.replace(/\.scss$/, '.css'), result.css + '\n');
  console.log(`Built ${source.replace(/\.scss$/, '.css')}`);
}
