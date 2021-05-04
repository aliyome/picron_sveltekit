import util from './util';
import guessAndConquer from './guessAndConquer';

import type { Cell, Solver } from './types';
import type Puzzle from './Puzzle';

/**
 * Strategy for solving a puzzle by applying line solvers repeatedly
 */
class Strategy {
	visited: { rows: Uint8Array[]; columns: Uint8Array[] };

	/**
	 * @param {Array} solvers List of line solvers sorted by speed
	 * @param {boolean} randomize `false` to run trial and error in order. Defaults to `true`.
	 *     In practice, using random guessing mostly yields faster results.
	 */
	constructor(
		public solvers: Solver[],
		public randomize = true,
		private debugMode = false,
		private maxRecursionLevel = 0,
	) {
		this.visited = {
			rows: [],
			columns: [],
		};
	}

	/**
	 * Solve the puzzle.
	 * @param {Puzzle} puzzle The puzzle to solve
	 * @param {boolean} withTrialAndError `false` to stop without trial and error. Defaults to `true`.
	 */
	solve(puzzle: Puzzle, withTrialAndError = true) {
		if (this.debugMode) {
			var start = Date.now();
			var statistics = Array(this.solvers.length).fill(0);
			var solutionSequence = [];
		}

		// keep tracks of visited lines
		this.visited = {
			rows: Array(puzzle.height)
				.fill(0)
				.map(() => new Uint8Array(this.solvers.length)),
			columns: Array(puzzle.width)
				.fill(0)
				.map(() => new Uint8Array(this.solvers.length)),
		};

		// repeatedly run all solvers on puzzle
		let progress = false;
		do {
			const snapshot = puzzle.snapshot;
			progress = false;
			this.solvers.forEach((solver, i) => {
				if (progress) {
					return;
				}
				// run one line solver on the whole puzzle
				this.solveOnce(puzzle, solver, i, solutionSequence);
				progress = puzzle.snapshot.toString() !== snapshot.toString();
				if (this.debugMode) {
					statistics[i]++;
				}
			});
		} while (progress);

		// no solution found… trial and error now
		if (withTrialAndError && !puzzle.isFinished) {
			if (this.debugMode) {
				console.log('must start guessing');
			}
			const deepResult = guessAndConquer(this, puzzle, 0, this.maxRecursionLevel, this.debugMode);
			if (deepResult) {
				puzzle.import(deepResult);
			}
		}

		if (this.debugMode) {
			console.log(`Solution sequence: [${solutionSequence.join(',')}]`);
			console.log(`Time elapsed: ${Date.now() - start}ms`);
			console.log(`Runs (on puzzle) per solver: ${JSON.stringify(statistics)}`);
		}
	}

	/**
	 * @private
	 * Run one solver on the puzzle
	 * @param {Puzzle} puzzle The puzzle to solve
	 * @param {Solver} solver The solver to use
	 * @param {number} solverIndex The solver's index in `this.solvers`
	 * @param {Array} solutionSequence Array of strings for statistics in debug mode
	 */
	solveOnce(puzzle: Puzzle, solver: Solver, solverIndex: number, solutionSequence: string[]) {
		// If we're dealing with a slow solver, we want to skip as soon as one line is partially solved
		let skipEarly = (solver as any).speed === 'slow';
		let skip = false;

		// Optimize iteration order
		let optimizeOrder = (lines: Cell[][], hints: number[][]) => {
			// remove already solved lines
			let unsolvedLines = lines.reduce((result, line, index) => {
				let zeros = line.reduce((count, x) => count + (x === 0 ? 1 : 0), 0);
				if (!zeros) {
					return result;
				}
				result.push({ line, index, zeros });
				return result;
			}, [] as { line: Cell[]; index: number; zeros: number; estimate?: number }[]);

			// sort by estimated computation effort
			if (skipEarly) {
				unsolvedLines.forEach((lineMeta) => {
					let { index, zeros } = lineMeta;
					let hintSum = util.hintSum(hints[index]);
					let estimate = zeros < hintSum ? 0 : Math.pow(zeros - hintSum, hints[index].length);

					lineMeta.estimate = estimate;
				});
				unsolvedLines.sort(({ estimate: left }, { estimate: right }) => left - right);
			}
			return unsolvedLines;
		};

		// the actual execution
		let run = (lines: Cell[][], hints: number[][], onRow?: boolean) => {
			let visited = onRow
				? { current: this.visited.rows, other: this.visited.columns }
				: { current: this.visited.columns, other: this.visited.rows };
			let rearrangedLines = optimizeOrder(lines, hints);
			rearrangedLines.forEach(({ line, index: i, estimate }) => {
				if (skip || visited.current[i][solverIndex]) {
					return;
				}
				if (this.debugMode) {
					console.log(
						`Running solver ${solverIndex} on ${onRow ? 'row' : 'column'} ${i}`,
						JSON.stringify(line.slice()),
						hints[i],
					);
					if (estimate) {
						console.log(`Estimated effort: ${estimate}`);
					}
				}
				visited.current[i][solverIndex] = 1;
				// First, trim unnecessary information from the line
				let [trimmedLine, trimmedHints, trimInfo] = util.trimLine(line, hints[i]);
				if (this.debugMode) {
					var start = Date.now();
				}
				// solver run
				let newLine = solver(trimmedLine, trimmedHints);

				if (this.debugMode) {
					let end = Date.now();
					if (end - start > 100) {
						console.log(`Long run: ${end - start}ms`);
					}
				}

				// now, restore the trimmed line and analyze the result
				let hasChanged = false;
				let changedLines = [];
				if (newLine) {
					// the solver may return null to indicate no progress
					newLine = util.restoreLine(newLine, trimInfo);
					line.forEach((el, i) => {
						// What has changed?
						if (el !== newLine[i]) {
							line[i] = newLine[i];
							// These perpendicular lines must be revisited
							visited.other[i].fill(0);
							if (this.debugMode) {
								changedLines.push(i);
							}
						}
					});
					hasChanged = changedLines.length > 0;
					skip = hasChanged && skipEarly;
				}

				if (!this.debugMode) {
					util.spinner.spin();
				} else if (hasChanged) {
					console.log(`found ${newLine}`);
					console.log(puzzle);
					console.log(
						`Must revisit ${onRow ? 'column' : 'row'}${
							changedLines.length > 1 ? 's' : ''
						} ${changedLines.join(',')}`,
					);
					solutionSequence.push(
						`(${solverIndex})${onRow ? 'r' : 'c'}${i}[${changedLines.join(',')}]`,
					);
				}
			});
		};

		// run on rows
		run(puzzle.rows, puzzle.rowHints, true);
		if (skip) {
			return;
		}
		// …and then on columns
		run(puzzle.columns, puzzle.columnHints);
	}
}

export default Strategy;
