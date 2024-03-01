import * as yaml from 'std/yaml/mod.ts';
import { walk } from 'std/fs/mod.ts';
import { Eta } from 'eta';

import { PageDefinition, defaultPageDefinition } from './definitions.ts';
import * as helpers from './helpers.ts';
import * as fsHelpers from './fsHelpers.ts';

const eta = new Eta({ views: './source/markup' });
const pagesData = yaml.parse(Deno.readTextFileSync('./pages.yaml')) as Record<string, PageDefinition>;

if(helpers.isDescriptionDefinedInMeta(pagesData))
  throw `A page's description was defined as a meta tag. Please use the 'description' property instead.`;

  //------------\\
 // ~MAIN BEGIN~ \\
//----------------\\
fsHelpers.prepareDirectoryStructure();

// Compile pages
for(const name in pagesData) {
  const res = eta.render(name, Object.assign({ ...defaultPageDefinition}, pagesData[name], { currentPage: name, pages: Object.keys(pagesData) }));
  Deno.writeTextFileSync(`./output/${name}.html`, await helpers.minifyHTML(res));
}

fsHelpers.copyUnknownAssets();

// Compile CSS                             Ignore non-CSS files ⬎
for await(const entry of walk('./source/assets/css/', { exts: ['css'] })) {
  const contents = Deno.readTextFileSync(entry.path);
  Deno.writeTextFileSync(`./output/assets/css/${entry.name}`, await helpers.minifyCSS(contents, entry.name));
}

// Compile JS                              Ignore non-JS files ⬎
for await(const entry of walk('./source/assets/js/', { exts: ['js'] })) {
  const contents = Deno.readTextFileSync(entry.path);
  Deno.writeTextFileSync(`./output/assets/js/${entry.name}`, contents);
}