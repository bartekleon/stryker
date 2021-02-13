import path from 'path';

import { AstByFormat, AstFormat } from '../syntax';

import { parse as htmlParse } from './html-parser';
import { createParser as createJSParser } from './js-parser';
import { ParserOptions } from './parser-options';
import { parse as tsParse } from './ts-parser';

export { ParserOptions };

export function createParser(
  parserOptions: ParserOptions
): <T extends AstFormat = AstFormat>(code: string, fileName: string, formatOverride?: T | undefined) => Promise<AstByFormat[T]> {
  const jsParse = createJSParser(parserOptions);
  return function parse<T extends AstFormat = AstFormat>(code: string, fileName: string, formatOverride?: T): Promise<AstByFormat[T]> {
    const format = getFormat(fileName, formatOverride);
    switch (format) {
      case AstFormat.JS:
        return jsParse(code, fileName) as Promise<AstByFormat[T]>;
      case AstFormat.TS:
        return tsParse(code, fileName) as Promise<AstByFormat[T]>;
      case AstFormat.Html:
        return htmlParse(code, fileName, { parse }) as Promise<AstByFormat[T]>;
    }
  };
}

export function getFormat(fileName: string, override?: AstFormat): AstFormat {
  if (override) {
    return override;
  } else {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.js':
      case '.jsx':
      case '.mjs':
      case '.cjs':
        return AstFormat.JS;
      case '.ts':
      case '.tsx':
        return AstFormat.TS;
      case '.vue':
      case '.html':
      case '.htm':
        return AstFormat.Html;
      default:
        throw new Error(`Unable to parse ${fileName}. No parser registered for ${ext}!`);
    }
  }
}
