import { commonTokens, declareFactoryPlugin, Injector, PluginKind, tokens, PluginContext } from '@stryker-mutator/api/plugin';
import { DirectoryRequireCache } from '@stryker-mutator/util';

import * as strykerValidationSchema from '../schema/mocha-runner-options.json';

import { MochaAdapter } from './MochaAdapter';
import MochaOptionsLoader from './MochaOptionsLoader';
import { MochaTestRunner } from './MochaTestRunner';
import * as pluginTokens from './plugin-tokens';

createMochaTestRunner.inject = tokens(commonTokens.injector);
export function createMochaTestRunner(injector: Injector<PluginContext>): MochaTestRunner {
  return injector
    .provideClass(pluginTokens.loader, MochaOptionsLoader)
    .provideClass(pluginTokens.mochaAdapter, MochaAdapter)
    .provideClass(pluginTokens.directoryRequireCache, DirectoryRequireCache)
    .injectClass(MochaTestRunner);
}

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner2, 'mocha', createMochaTestRunner)];

export { strykerValidationSchema, MochaTestRunner };
