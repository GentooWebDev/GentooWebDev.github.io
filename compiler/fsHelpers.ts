import { copySync, ensureDirSync } from 'std/fs/mod.ts';

export function prepareDirectoryStructure() {
  // Remove ./output and all of it's contents
  ensureDirSync('./output');
  Deno.removeSync('./output', { recursive: true })

  // Ensure the basic source directory structure exists.
  ensureDirSync('./source/assets/css');
  ensureDirSync('./source/assets/js');

  // Ensure the ./output directory exists.
  ensureDirSync('./output');
}

export function copyUnknownAssets() {
  // Copy all assets over to output
  copySync('./source/assets', './output/assets');

  // Remove "known" assets that will be processed later
  Deno.removeSync('./output/assets/css', { recursive: true })
  Deno.removeSync('./output/assets/js', { recursive: true })

  // Ensure that "known" assets' respective output directories exist.
  ensureDirSync('./output/assets/css');
  ensureDirSync('./output/assets/js');
}