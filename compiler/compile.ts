import * as yaml from 'std/yaml/mod.ts';
import { walk } from 'std/fs/mod.ts';
import { Eta } from 'eta';

import { ConfigData, isConfigData, isPageDefinition } from './definitions.ts';
import * as helpers from './helpers.ts';
import * as fsHelpers from './fsHelpers.ts';

const eta = new Eta({ views: './source/markup' });
const configData = yaml.parse(Deno.readTextFileSync('./config.yaml')) as ConfigData;

if(!isConfigData(configData))
  throw 'The config file is not properly formatted.';

const pagesData = configData.pages;

if(helpers.isDescriptionDefinedInMeta(pagesData))
  throw `A page's description was defined as a meta tag. Please use the 'description' property instead.`;

fsHelpers.prepareDirectoryStructure();

// Compile pages
for(const name in pagesData) {
  const fullPageData = Object.assign(
    { ...helpers.getDefaultPageDefinition(configData.defaultPage) },
    pagesData[name],
    { currentPage: name, pages: Object.keys(pagesData) }
  );

  if(!isPageDefinition(fullPageData))
    throw `The page '${name}' is not properly formatted.`;

  // Render the page
  const res = eta.render(
    name,
    helpers.fixAllJSDefinitions(fullPageData)
  );

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