export interface MetaData {
  name: string,
  content: Record<string, string> | string
}

export interface PageDefinition {
  title: string,
  description: string,
  css?: string[],
  js?: string[],
  gfonts?: string[],
  meta?: MetaData[]
}

export interface ConfigData {
  defaultPage?: Partial<PageDefinition>,
  pages: Record<string, PageDefinition>
}

export type PageDefinitionFile = Record<string, PageDefinition>

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