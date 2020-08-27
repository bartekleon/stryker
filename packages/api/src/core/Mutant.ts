import Location from './Location';
import Range from './Range';

interface Mutant {
  id: number;
  mutatorName: string;
  fileName: string;
  range: Range;
  location: Location;
  replacement: string;
}

export default Mutant;
