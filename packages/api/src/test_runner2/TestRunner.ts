import { DryRunResult } from './DryRunResult';
import { MutantRunResult } from './MutantRunResult';
import { DryRunOptions, MutantRunOptions } from './RunOptions';

export interface TestRunner2 {
  init?(): Promise<void>;
  dryRun(options: DryRunOptions): Promise<DryRunResult>;
  mutantRun(options: MutantRunOptions): Promise<MutantRunResult>;
  dispose?(): Promise<void>;
}
