import * as yaml from 'https://deno.land/std@0.212.0/yaml/mod.ts';
import { copySync, ensureDirSync, walk } from 'https://deno.land/std@0.212.0/fs/mod.ts';
import { Eta } from 'https://deno.land/x/eta@v3.2.0/src/index.ts';
import { minify } from 'npm:html-minifier-terser';
import autoprefixer from 'npm:autoprefixer';
import nested from 'npm:postcss-nested';
import cssnano from 'npm:cssnano';
import postcss from 'npm:postcss';

interface PageDefinition {
  title: string,
  description: string,
  css?: string[],
  js?: string[],
  gfonts?: string[],
  meta?: Record<string, string>[]
}

const eta = new Eta({ views: './source/markup' });
const pagesData = yaml.parse(Deno.readTextFileSync('./pages.yaml')) as Record<string, PageDefinition>;

  //------------\\
 // ~MAIN BEGIN~ \\
//----------------\\
prepareDirectoryStructure();

// Compile pages
for(const name in pagesData) {
  const res = eta.render(name, pagesData[name]);
  Deno.writeTextFileSync(`./output/${name}.html`, await minHTML(res));
}

copyUnknownAssets();

// Compile CSS                             Ignore non-CSS files ⬎
for await(const entry of walk('./source/assets/css/', { exts: ['css'] })) {
  const contents = Deno.readTextFileSync(entry.path);
  Deno.writeTextFileSync(`./output/assets/css/${entry.name}`, await minCSS(contents, entry.name));
}

// Compile JS                              Ignore non-JS files ⬎
for await(const entry of walk('./source/assets/js/', { exts: ['js'] })) {
  const contents = Deno.readTextFileSync(entry.path);
  Deno.writeTextFileSync(`./output/assets/js/${entry.name}`, contents);
}

  //-------------\\
 // ~UTILS BEGIN~ \\
//-----------------\\

function prepareDirectoryStructure() {
  // Remove ./output and all of it's contents
  ensureDirSync('./output');
  Deno.removeSync('./output', { recursive: true })

  // Ensure the basic source directory structure exists.
  ensureDirSync('./source/assets/css');
  ensureDirSync('./source/assets/js');

  // Ensure the ./output directory exists.
  ensureDirSync('./output');
}

function copyUnknownAssets() {
  // Copy all assets over to output
  copySync('./source/assets', './output/assets');

  // Remove "known" assets that will be processed later
  Deno.removeSync('./output/assets/css', { recursive: true })
  Deno.removeSync('./output/assets/js', { recursive: true })

  // Ensure that "known" assets' respective output directories exist.
  ensureDirSync('./output/assets/css');
  ensureDirSync('./output/assets/js');
}

async function minHTML(html: string) {
  return await minify(html, {
    caseSensitive: true,
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    decodeEntities: true,
    minifyCSS: true,
    minifyJS: true,
    quoteCharacter: '"',
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
  });
}

async function minCSS(css: string, name: string) {
  const result = await postcss([
    nested,
    autoprefixer,
    cssnano
  ]).process(css, { from: `./source/assets/css/${name}` }).async();

  return result.css;
}