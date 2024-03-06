import { minify } from 'npm:html-minifier-terser';

import autoprefixer from 'npm:autoprefixer';
import nested from 'npm:postcss-nested';
import cssnano from 'npm:cssnano';
import postcss from 'npm:postcss';
import customproperties from 'npm:postcss-custom-properties';
import calc from 'npm:postcss-calc';
import vars from 'npm:postcss-nested-vars';

import { JSDefintion, PageDefinition, defaultPageDefinition } from './definitions.ts';

export async function minifyCSS(css: string, name: string) {
  //@ts-ignore:
  const result = await postcss([
    vars(),
    nested,
    customproperties({ preserve: true }),
    calc({ warnWhenCannotResolve: true }),
    autoprefixer,
    cssnano
  ]).process(css, { from: `./source/assets/css/${name}` }).async();

  return result.css;
}

export async function minifyHTML(html: string) {
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

export function isDescriptionDefinedInMeta(pageData: Record<string, Partial<PageDefinition>>) {
  for (const data of Object.values(pageData)) {
    if(data.meta?.some(meta => meta.name == 'description'))
      return true;
  }

  return false;
}

export function getDefaultPageDefinition(defaultPage?: Partial<PageDefinition>) {
  return Object.assign(
    defaultPageDefinition,
    defaultPage || {}
  );
}

export function getJSDefinition(input: string | JSDefintion): JSDefintion {
  if(typeof input !== 'string') return input;

  return {
    path: input,
    module: false,
    mode: 'defer'
  };
}

export function fixAllJSDefinitions(page: PageDefinition) {
  page.js = page.js?.map(getJSDefinition);
  return page;
}