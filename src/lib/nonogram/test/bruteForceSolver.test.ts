import path from 'path';

import runTestsOnJSON from './runTestsOnJSON';
import bruteForceSolver from '../solvers/bruteForceSolver';

describe('bruteForceSolver', () => {
	describe('solving', () => {
		runTestsOnJSON(bruteForceSolver.solve, path.resolve(__dirname, 'resources', 'bruteForce.json'));
	});
});
