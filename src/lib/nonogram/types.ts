export const cellType = {
	Unknown: 0,
	Checked: 1,
	Empty: -1,
} as const;

export type CellType = typeof cellType[keyof typeof cellType];

export type PuzzleData = {
	columns: number[][];
	rows: number[][];
	content: CellType[];
};

type SolverFunc = (line: CellType[], hints: number[]) => CellType[];
export type Solver = SolverFunc & { speed: string };
