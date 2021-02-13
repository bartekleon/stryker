import path from 'path';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { FilePreprocessor } from './file-preprocessor';

/**
 * A helper class that rewrites `references` and `extends` file paths if they end up falling outside of the sandbox.
 * @example
 * {
 *   "extends": "../../tsconfig.settings.json",
 *   "references": {
 *      "path": "../model"
 *   }
 * }
 * becomes:
 * {
 *   "extends": "../../../../tsconfig.settings.json",
 *   "references": {
 *      "path": "../../../model"
 *   }
 * }
 */
export class TSConfigPreprocessor implements FilePreprocessor {
  private readonly touched: string[] = [];
  private readonly fs = new Map<string, File>();
  public static readonly inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(private readonly log: Logger, private readonly options: StrykerOptions) {}

  public async preprocess(input: File[]): Promise<File[]> {
    if (this.options.inPlace) {
      // If stryker is running 'inPlace', we don't have to change the tsconfig file
      return input;
    } else {
      const tsconfigFile = path.resolve(this.options.tsconfigFile);
      if (input.find((file) => file.name === tsconfigFile)) {
        this.fs.clear();
        input.forEach((file) => {
          this.fs.set(file.name, file);
        });
        await this.rewriteTSConfigFile(tsconfigFile);
        return [...this.fs.values()];
      } else {
        return input;
      }
    }
  }

  private async rewriteTSConfigFile(tsconfigFileName: string): Promise<void> {
    if (!this.touched.includes(tsconfigFileName)) {
      this.touched.push(tsconfigFileName);
      const tsconfigFile = this.fs.get(tsconfigFileName);
      if (tsconfigFile) {
        this.log.debug('Rewriting file %s', tsconfigFile);
        const ts = await import('typescript');
        const { config } = ts.parseConfigFileTextToJson(tsconfigFile.name, tsconfigFile.textContent);
        if (config) {
          await this.rewriteExtends(config, tsconfigFileName);
          await this.rewriteProjectReferences(config, tsconfigFileName);
          this.fs.set(tsconfigFileName, new File(tsconfigFileName, JSON.stringify(config, null, 2)));
        }
      }
    }
  }

  private async rewriteExtends(config: any, tsconfigFileName: string): Promise<boolean> {
    if (typeof config.extends === 'string') {
      const extendsFileName = path.resolve(path.dirname(tsconfigFileName), config.extends);
      const relativeToSandbox = path.relative(process.cwd(), extendsFileName);
      if (relativeToSandbox.startsWith('..')) {
        config.extends = this.join('..', '..', config.extends);
        return true;
      } else {
        await this.rewriteTSConfigFile(extendsFileName);
      }
    }
    return false;
  }

  private async rewriteProjectReferences(config: { references?: Array<{ path: string }> }, originTSConfigFileName: string): Promise<void> {
    const ts = await import('typescript');
    if (Array.isArray(config.references)) {
      for (const reference of config.references) {
        const referencePath = ts.resolveProjectReferencePath(reference);
        const referencedProjectFileName = path.resolve(path.dirname(originTSConfigFileName), referencePath);
        const relativeToProject = path.relative(process.cwd(), referencedProjectFileName);
        if (relativeToProject.startsWith('..')) {
          reference.path = this.join('..', '..', referencePath);
        } else {
          await this.rewriteTSConfigFile(referencedProjectFileName);
        }
      }
    }
  }

  private join(...pathSegments: string[]) {
    return pathSegments.map((segment) => segment.replace(/\\/g, '/')).join('/');
  }
}
