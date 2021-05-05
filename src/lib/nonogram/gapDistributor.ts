import pushSolver from './solvers/pushSolver';
import type { Cell } from './types';
const pushLeft = pushSolver.pushLeft;

const findGaps = (line: Cell[]): number[] =>
	line.reduce((result, el, i, line) => {
		if (el > -1) {
			if (line[i - 1] > -1) {
				result[result.length - 1][1]++;
			} else {
				result.push([i, i + 1]);
			}
		}
		return result;
	}, []);

const allWithOneGap = (
	line: Cell[],
	gaps: number[],
	hints: number[],
): {
	gaps: number[];
	distributions: number[][][];
} | null => {
	const left = gaps[0][0];
	const right = gaps[0][1];
	if (pushLeft(line.slice(left, right), hints)) {
		return { gaps, distributions: [[hints]] };
	}
	return null;
};

const gapDistributor = (
	line: Cell[],
	hints: number[],
): {
	gaps: number[];
	distributions: number[][][];
} => {
	const gaps = findGaps(line);
	if (gaps.length === 1) {
		return allWithOneGap(line, gaps, hints);
	}
	const distributions: number[][][] = [];
	const gap = gaps[0];
	for (let hintCount = 0; hintCount <= hints.length; hintCount++) {
		const first = allWithOneGap(line, [gap], hints.slice(0, hintCount));
		if (!first) {
			continue;
		}
		const second = gapDistributor(line.slice(gap[1]), hints.slice(hintCount));
		if (!second) {
			continue;
		}
		first.distributions.forEach((x) => {
			x.forEach((e) => {
				second.distributions.forEach((y) => {
					const item = y.slice();
					item.unshift(e);
					distributions.push(item);
				});
			});
		}, []);
	}
	return { gaps, distributions };
};

export default gapDistributor;
