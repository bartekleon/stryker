import { InjectableClass, InjectableFunction, InjectionToken } from 'typed-inject';

import { Checker } from '../../check';
import { Reporter } from '../../report';
import { TestRunner } from '../../test_runner';
import { TestRunner2 } from '../../test_runner2';

import { PluginContext } from './Contexts';
import { PluginKind } from './PluginKind';

/**
 * Represents a StrykerPlugin
 */
export type Plugin<TPluginKind extends PluginKind> =
  | FactoryPlugin<TPluginKind, Array<InjectionToken<PluginContext>>>
  | ClassPlugin<TPluginKind, Array<InjectionToken<PluginContext>>>;

/**
 * Represents a plugin that is created with a factory method
 */
export interface FactoryPlugin<TPluginKind extends PluginKind, Tokens extends Array<InjectionToken<PluginContext>>> {
  readonly kind: TPluginKind;
  readonly name: string;
  /**
   * The factory method used to create the plugin
   */
  readonly factory: InjectableFunction<PluginContext, PluginInterfaces[TPluginKind], Tokens>;
}

/**
 * Represents a plugin that is created by instantiating a class.
 */
export interface ClassPlugin<TPluginKind extends PluginKind, Tokens extends Array<InjectionToken<PluginContext>>> {
  readonly kind: TPluginKind;
  readonly name: string;
  /**
   * The prototype function (class) used to create the plugin.
   * Not called `class` here, because that is a keyword
   */
  readonly injectableClass: InjectableClass<PluginContext, PluginInterfaces[TPluginKind], Tokens>;
}

/**
 * Declare a class plugin. Use this method in order to type check the dependency graph of your plugin
 * @param kind The plugin kind
 * @param name The name of the plugin
 * @param injectableClass The class to be instantiated for the plugin
 */
export function declareClassPlugin<TPluginKind extends PluginKind, Tokens extends Array<InjectionToken<PluginContext>>>(
  kind: TPluginKind,
  name: string,
  injectableClass: InjectableClass<PluginContext, PluginInterfaces[TPluginKind], Tokens>
): ClassPlugin<TPluginKind, Tokens> {
  return {
    injectableClass,
    kind,
    name,
  };
}

/**
 * Declare a factory plugin. Use this method in order to type check the dependency graph of your plugin,
 * @param kind The plugin kind
 * @param name The name of the plugin
 * @param factory The factory used to instantiate the plugin
 */
export function declareFactoryPlugin<TPluginKind extends PluginKind, Tokens extends Array<InjectionToken<PluginContext>>>(
  kind: TPluginKind,
  name: string,
  factory: InjectableFunction<PluginContext, PluginInterfaces[TPluginKind], Tokens>
): FactoryPlugin<TPluginKind, Tokens> {
  return {
    factory,
    kind,
    name,
  };
}

/**
 * Lookup type for plugin interfaces by kind.
 */
export interface PluginInterfaces {
  [PluginKind.Reporter]: Reporter;
  [PluginKind.TestRunner]: TestRunner;
  [PluginKind.TestRunner2]: TestRunner2;
  [PluginKind.Checker]: Checker;
}

/**
 * Lookup type for plugins by kind.
 */
export type Plugins = {
  [TPluginKind in keyof PluginInterfaces]: Plugin<TPluginKind>;
};

/**
 * Plugin resolver responsible to load plugins
 */
export interface PluginResolver {
  resolve<T extends keyof Plugins>(kind: T, name: string): Plugins[T];
  resolveAll<T extends keyof Plugins>(kind: T): Array<Plugins[T]>;
  resolveValidationSchemaContributions(): Array<Record<string, unknown>>;
}
