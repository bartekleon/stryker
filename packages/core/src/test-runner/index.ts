import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { TestRunner2 } from '@stryker-mutator/api/test_runner2';

import { coreTokens } from '../di';
import { LoggingClientContext } from '../logging';
import { Sandbox } from '../sandbox/sandbox';

import ChildProcessTestRunnerDecorator from './ChildProcessTestRunnerDecorator';
import CommandTestRunner from './CommandTestRunner';
import RetryDecorator from './RetryDecorator';
import TimeoutDecorator from './TimeoutDecorator';

createTestRunnerFactory.inject = tokens(commonTokens.options, coreTokens.sandbox, coreTokens.loggingContext);
export function createTestRunnerFactory(
  options: StrykerOptions,
  sandbox: Pick<Sandbox, 'sandboxFileNames' | 'workingDirectory'>,
  loggingContext: LoggingClientContext
): () => Required<TestRunner2> {
  if (CommandTestRunner.is(options.testRunner)) {
    return () => new RetryDecorator(() => new TimeoutDecorator(() => new CommandTestRunner(sandbox.workingDirectory, options)));
  } else {
    return () =>
      new RetryDecorator(() => new TimeoutDecorator(() => new ChildProcessTestRunnerDecorator(options, sandbox.workingDirectory, loggingContext)));
  }
}
