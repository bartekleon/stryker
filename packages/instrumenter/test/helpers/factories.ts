import { types } from '@babel/core';

import { InstrumenterOptions } from '../../src';
import { Mutant, NamedNodeMutation } from '../../src/mutant';
import { ParserOptions } from '../../src/parsers';
import { JSAst, AstFormat, HtmlAst, TSAst } from '../../src/syntax';

import { parseTS, parseJS, findNodePath } from './syntax-test-helpers';

export function createParserOptions(overrides?: Partial<ParserOptions>): ParserOptions {
  return {
    plugins: null,
    ...overrides,
  };
}

export function createInstrumenterOptions(overrides?: Partial<InstrumenterOptions>): InstrumenterOptions {
  return {
    ...createParserOptions(),
    ...overrides,
  };
}

export function createHtmlAst(overrides?: Partial<HtmlAst>): HtmlAst {
  return {
    format: AstFormat.Html,
    originFileName: 'example.html',
    rawContent: '<htm></html>',
    root: {
      scripts: [],
    },
    ...overrides,
  };
}

export function createJSAst(overrides?: Partial<JSAst>): JSAst {
  const rawContent = overrides?.rawContent ?? 'foo.bar(41, 1)';
  return {
    format: AstFormat.JS,
    originFileName: 'example.js',
    rawContent,
    root: parseJS(rawContent),
    ...overrides,
  };
}

export function createTSAst(overrides?: Partial<TSAst>): TSAst {
  const rawContent = overrides?.rawContent ?? 'foo.bar(41, 1)';
  const originFileName = overrides?.originFileName ?? 'example.ts';
  return {
    format: AstFormat.TS,
    originFileName,
    rawContent,
    root: parseTS(rawContent, originFileName),
    ...overrides,
  };
}

export function createMutant(overrides?: Partial<Mutant>): Mutant {
  return new Mutant(
    overrides?.id ?? 1,
    overrides?.original ?? types.identifier('foo'),
    overrides?.replacement ?? types.identifier('bar'),
    overrides?.fileName ?? 'example.js',
    overrides?.mutatorName ?? 'fooMutator'
  );
}

export function createNamedNodeMutation(overrides?: Partial<NamedNodeMutation>): NamedNodeMutation {
  return {
    mutatorName: 'fooMutator',
    original: findNodePath(parseJS('foo'), (t) => t.isIdentifier()).node,
    replacement: findNodePath(parseJS('bar'), (t) => t.isIdentifier()).node,
    ...overrides,
  };
}
