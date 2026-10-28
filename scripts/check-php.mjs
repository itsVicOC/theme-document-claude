import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime } from '@php-wasm/node';
import { readFileSync, readdirSync } from 'node:fs';
const php = new PHP(await loadNodeRuntime('8.3', {emscriptenOptions: {processId: 1}}));
const files = [];
function collect(dir) {
  for (const item of readdirSync(dir, {withFileTypes: true})) {
    if (['node_modules', '.git', 'dist'].includes(item.name)) continue;
    const file = `${dir}/${item.name}`;
    if (item.isDirectory()) collect(file);
    else if (item.name.endsWith('.php')) files.push(file);
  }
}
collect('.');
for (const file of files) {
  php.writeFile('/lint.php', readFileSync(file));
  const result = await php.run({code: '<?php try { token_get_all(file_get_contents("/lint.php"), TOKEN_PARSE); } catch (ParseError $e) { echo $e->getMessage(); }'});
  if (result.text || result.errors) throw new Error(`${file}: ${result.text} ${result.errors}`);
}
console.log(`PHP 8.3 syntax: ${files.length} files passed`);
php.exit();
