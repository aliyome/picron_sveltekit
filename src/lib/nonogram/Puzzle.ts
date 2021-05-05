import type { CellType, PuzzleData } from './types';
import util from './util';
import ascii from './serializers/ascii';
import svg from './serializers/svg';

const { clone } = util;

class Puzzle {
	rowHints: number[][];
	columnHints: number[][];
	height: number;
	width: number;
	originalContent: CellType[];
	state: CellType[];

	declare import: (puzzle: Puzzle) => void;
	declare toJSON: () => {
		columns: number[][];
		rows: number[][];
		content: CellType[];
	};
	declare rows: CellType[][];
	declare columns: CellType[][];
	declare isFinished: boolean;
	declare snapshot: CellType[];
	declare isSolved: boolean;

	constructor(data: string | PuzzleData) {
		let puzzleData: PuzzleData;
		if (typeof data === 'string') {
			puzzleData = JSON.parse(data);
		} else {
			puzzleData = data;
		}
		const initialState = this.mapData(puzzleData);
		this.state = initialState;
		this.initAccessors(initialState);
	}
	mapData(data: PuzzleData): CellType[] {
		const cleanClone = (hints: number[][]) =>
			hints.map((h) => {
				if (h.length === 1 && h[0] === 0) {
					return [];
				}
				return clone(h);
			});
		this.rowHints = cleanClone(data.rows);
		this.columnHints = cleanClone(data.columns);
		this.height = this.rowHints.length;
		this.width = this.columnHints.length;
		this.checkConsistency(data);
		if (data.content) {
			this.originalContent = clone(data.content);
			return clone(data.content);
		}
		return new Array(this.width * this.height).fill(0);
	}

	initAccessors(state: CellType[]): void {
		const width = this.width;
		const height = this.height;

		const rows: CellType[][] = new Array(height);
		const makeRow = (rowIndex: number): CellType[] => {
			const row: CellType[] = Array(width).fill(0);
			row.forEach((_, colIndex) => {
				// TODO: extract to class
				Object.defineProperty(row, colIndex, {
					get() {
						return state[rowIndex * width + colIndex];
					},
					set(el) {
						state[rowIndex * width + colIndex] = el;
					},
				});
			});
			return row;
		};
		for (let rowIndex = 0; rowIndex < height; rowIndex++) {
			const row = makeRow(rowIndex);
			// TODO: extract to class
			Object.defineProperty(rows, rowIndex, {
				get() {
					return row;
				},
				set(newRow: CellType[]) {
					newRow.forEach((el, x) => (state[rowIndex * width + x] = el));
				},
			});
		}

		const columns: CellType[][] = Array(width);
		const makeColumn = (colIndex: number): CellType[] => {
			const column: CellType[] = Array(height).fill(0);
			column.forEach((_, rowIndex) => {
				// TODO: extract to class
				Object.defineProperty(column, rowIndex, {
					get() {
						return state[rowIndex * width + colIndex];
					},
					set(el) {
						state[rowIndex * width + colIndex] = el;
					},
				});
			});
			return column;
		};
		for (let colIndex = 0; colIndex < width; colIndex++) {
			const column = makeColumn(colIndex);
			Object.defineProperty(columns, colIndex, {
				get() {
					return column;
				},
				set(newCol: CellType[]) {
					newCol.forEach((el, y) => (state[y * width + colIndex] = el));
				},
			});
		}

		// TODO: move to class methods
		Object.defineProperties(this, {
			rows: {
				get() {
					return rows;
				},
				set(newRows: CellType[][]) {
					newRows.forEach((el, i) => {
						rows[i] = el;
					});
				},
			},
			columns: {
				get() {
					return columns;
				},
				set(cols: CellType[][]) {
					cols.forEach((el, i) => {
						columns[i] = el;
					});
				},
			},
			isFinished: {
				get() {
					return state.every((item) => item !== 0);
				},
			},
			snapshot: {
				get() {
					return clone(state);
				},
			},
			isSolved: {
				get() {
					const isOk = (line: CellType[], hints: number[]) => {
						const actual = line
							.join('')
							.split(/(?:-1)+/g)
							.map((x) => x.length)
							.filter((x) => x);
						return actual.length === hints.length && actual.every((x, i) => x === hints[i]);
					};
					return (
						this.isFinished &&
						columns.every((col, i) => isOk(col, this.columnHints[i])) &&
						rows.every((row, i) => isOk(row, this.rowHints[i]))
					);
				},
			},
		});

		this.import = function (puzzle: Puzzle) {
			state = clone(puzzle.snapshot);
		};

		this.toJSON = function () {
			return {
				columns: this.columnHints,
				rows: this.rowHints,
				content: state,
			};
		};
	}

	checkConsistency({ rows, columns, content }: PuzzleData): void {
		if (content) {
			let invalid = !content || !Array.isArray(content);
			invalid = invalid || content.length !== this.height * this.width;
			invalid = invalid || !content.every((i) => i === -1 || i === 0 || i === 1);
			util.assert(!invalid, 'Invalid content data');
		}
		const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
		const rowSum = sum(rows.map(sum));
		const columnSum = sum(columns.map(sum));
		util.assert(rowSum === columnSum, 'Invalid hint data');
	}

	inspect(): string {
		// called by console.log
		return ascii(this);
	}

	get svg(): string {
		return svg(this);
	}
}

export default Puzzle;
