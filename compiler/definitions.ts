export interface MetaData {
  name: string,
  content: Record<string, string> | string
}

export function isMetaData(data: unknown): data is MetaData {
  return (
    data !== null
    && typeof data === 'object'
    && 'name' in data
    && data.name !== null
    && typeof data.name === 'string'
    && 'content' in data
    && (
      typeof data.content === 'string'
      || (
        data.content !== null
        && typeof data.content === 'object'
        && Object.keys(data.content).every(key =>
          typeof key === 'string'
          && typeof (data.content as Record<string, unknown>)[key] === 'string'
        )
      )
    )
  );
}

export interface JSDefintion {
  path: string,
  module: boolean,
  mode?: 'async' | 'defer'
}

export function isJSDefinition(data: unknown): data is JSDefintion {
  return (
    data !== null
    && typeof data === 'object'
    && 'path' in data
    && typeof data.path === 'string'
    && 'module' in data
    && typeof data.module === 'boolean'
    && (
      'mode' in data
      ? typeof data.mode === 'string'
        && (data.mode === 'async' || data.mode === 'defer')
      : true
    )
  );
}

export interface PageDefinition {
  title: string,
  description: string,
  css?: string[],
  js?: Array<string | JSDefintion>,
  gfonts?: string[],
  meta?: MetaData[]
}

export function isPageDefinition(data: unknown): data is PageDefinition {
  return (
    data !== null
    && typeof data === 'object'
    && 'title' in data
    && typeof data.title === 'string'
    && 'description' in data
    && typeof data.description === 'string'
    && (
      'css' in data
      ? Array.isArray(data.css)
        && data.css.every(item => typeof item === 'string')
      : true
    )
    && (
      'js' in data
      ? Array.isArray(data.js)
        && data.js.every(item =>
          typeof item === 'string'
          || isJSDefinition(item)
        )
      : true
    )
    && (
      'gfonts' in data
      ? Array.isArray(data.gfonts)
        && data.gfonts.every(item => typeof item === 'string')
      : true
    )
    && (
      'meta' in data
      ? Array.isArray(data.meta)
        && data.meta.every(isMetaData)
      : true
    )
  );
}

export function isPartialPageDefinition(data: unknown): data is Partial<PageDefinition> {
  return (
    data !== null
    && typeof data === 'object'
    && (
      'title' in data
      ? typeof data.title === 'string'
      : true
    )
    && (
      'description' in data
      ? typeof data.description === 'string'
      : true
    )
    && (
      'css' in data
        ? Array.isArray(data.css)
        && data.css.every(item => typeof item === 'string')
        : true
    )
    && (
      'js' in data
        ? Array.isArray(data.js)
        && data.js.every(item =>
          typeof item === 'string'
          || isJSDefinition(item)
        )
        : true
    )
    && (
      'gfonts' in data
        ? Array.isArray(data.gfonts)
        && data.gfonts.every(item => typeof item === 'string')
        : true
    )
    && (
      'meta' in data
        ? Array.isArray(data.meta)
        && data.meta.every(isMetaData)
        : true
    )
  );
}

export interface ConfigData {
  defaultPage?: Partial<PageDefinition>,
  pages: Record<string, Partial<PageDefinition>>
}

export function isConfigData(data: unknown): data is ConfigData {
  return (
    data !== null
    && typeof data === 'object'
    && (
      'defaultPage' in data
      ? isPartialPageDefinition(data.defaultPage)
      : true
    )
    && 'pages' in data
    && data.pages !== null
    && typeof data.pages === 'object'
    && Object.keys(data.pages).every(key =>
      typeof key === 'string'
      && isPartialPageDefinition((data.pages as Record<string, unknown>)[key])
    )
  );
}

export const defaultPageDefinition: Partial<PageDefinition> = {
  meta: [
    {
      name: 'viewport',
      content: {
        width: 'device-width',
        'initial-scale': '1.0'
      }
    }
  ]
};