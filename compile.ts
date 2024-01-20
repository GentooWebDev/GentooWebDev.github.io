import * as yaml from 'https://deno.land/std@0.212.0/yaml/mod.ts';
import { copySync, ensureDirSync, walk } from 'https://deno.land/std@0.212.0/fs/mod.ts';
import { Eta } from 'https://deno.land/x/eta@v3.2.0/src/index.ts';
import { minify as minHTML } from 'npm:html-minifier';
import CleanCSS from 'npm:clean-css';

interface PageDefinition {
  title: string,
  description: string,
  css: string[],
  js: string[],
}

const htmlMinifierOptions = {
  caseSensitive: true,
  collapseBooleanAttributes: true,
  decodeEntities: true,
  minifyCSS: true,
  minifyJS: true,
  quoteCharacter: '"',
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,

};

const minCSS = new CleanCSS();

const eta = new Eta({ views: './source/markup' });
const data = yaml.parse(Deno.readTextFileSync('./pages.yaml')) as Record<string, PageDefinition>;

  //------------\\
 // ~MAIN BEGIN~ \\
//----------------\\
ensureDirSync('./output');
Deno.removeSync('./output', { recursive: true })

ensureDirSync('./source/assets/css');
ensureDirSync('./source/assets/js');
ensureDirSync('./output');

for(const name in data) {
  const res = eta.render(name, data[name]);
  Deno.writeTextFileSync(`./output/${name}.html`, minHTML(res, htmlMinifierOptions));
}

copySync('./source/assets', './output/assets');
Deno.removeSync('./output/assets/css', { recursive: true })
Deno.removeSync('./output/assets/js', { recursive: true })

ensureDirSync('./output/assets/css');
ensureDirSync('./output/assets/js');

for await(const entry of walk('./source/assets/css/', { exts: [ 'css' ] })) {
  console.log(entry.path);

  const contents = Deno.readTextFileSync(entry.path);
  Deno.writeTextFileSync(`./output/assets/css/${entry.name}`, contents);
}

for await (const entry of walk('./source/assets/js/', { exts: ['js'] })) {
  console.log(entry.path);

  const contents = Deno.readTextFileSync(entry.path);
  Deno.writeTextFileSync(`./output/assets/js/${entry.name}`, contents);
}