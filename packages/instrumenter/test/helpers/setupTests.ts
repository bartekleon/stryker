import { sep } from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiJestSnapshot from 'chai-jest-snapshot';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiJestSnapshot);

let originalCwd: string;

afterEach(() => {
  sinon.restore();
  testInjector.reset();
  process.chdir(originalCwd);
});

before(() => {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  originalCwd = process.cwd();
  chaiJestSnapshot.configureUsingMochaContext(this);
  chaiJestSnapshot.setFilename(this.currentTest!.file!.replace(`${sep}dist`, '') + '.snap');
});
