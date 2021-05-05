export const cellType = {
	Unknown: 0,
	Checked: 1,
	Empty: -1,
} as const;

export type Cell = typeof cellType[keyof typeof cellType];

export type PuzzleData = {
	columns: number[][];
	rows: number[][];
	content: Cell[];
};

type SolverFunc = (line: Cell[], hints: number[]) => Cell[];
export type Solver = SolverFunc & { speed: string };
