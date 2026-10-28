import { mkdtempSync, copyFileSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const work = mkdtempSync(join(tmpdir(), 'document-theme-install-'));
const zipName = 'theme-document.zip';
const wp = process.env.DOCUMENT_TEST_WP || '7.1.3';
const php = process.env.DOCUMENT_TEST_PHP || '8.3';
copyFileSync(join(root, 'dist', zipName), join(work, zipName));
const blueprint = {steps:[{step:'runPHP',code:`<?php define('DOCUMENT_PACKAGE_TEST', '${zipName}'); require '/test-scripts/install-package.php';`}]};
writeFileSync(join(work, 'blueprint.json'), JSON.stringify(blueprint));
const result = spawnSync(process.execPath, [
  join(root, 'node_modules/@wp-playground/cli/wp-playground.js'), 'run-blueprint',
  `--php=${php}`, `--wp=${wp}`, `--mount=${work}:/test-artifacts`,
  `--mount=${join(root,'tests')}:/test-scripts`, `--blueprint=${join(work,'blueprint.json')}`,
], {cwd:work, stdio:'inherit'});
assert.equal(result.status, 0, `Native installer test failed; artifacts preserved at ${work}`);
const report = JSON.parse(readFileSync(join(work, `${zipName}.result.json`),'utf8'));
const version = JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
for (const [extractor, item] of Object.entries(report)) {
  assert.equal(item.success, true, `${extractor}: installation failed`);
  assert.equal(item.overwriteSuccess, true, `${extractor}: replacement failed`);
  assert.equal(item.themeExists, true);
  assert.equal(item.name, 'Document');
  assert.equal(item.version, version);
  assert.deepEqual(item.themeErrors, []);
  assert.equal(item.installedDirectory, '/wordpress/wp-content/themes/theme-document');
}
mkdirSync(join(root,'docs/qa'),{recursive:true});
writeFileSync(join(root,'docs/qa',`install-wp-${wp}-php-${php}.json`), JSON.stringify({wordpress:wp,php,archive:zipName,results:report},null,2)+'\n');
rmSync(work,{recursive:true,force:true});
console.log(`WordPress ${wp}/PHP ${php}: ZIP installation and replacement passed (default + PclZip).`);
