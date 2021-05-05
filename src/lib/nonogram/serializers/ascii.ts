import type Puzzle from '../Puzzle';

/**
 * Draw a puzzle in ASCII art
 */
const draw = ({ rowHints, columnHints, rows }: Puzzle): string => {
	let result = '';
	const maxLength = (a: string[]) =>
		a.map((x) => x.length).reduce((max, i) => (i > max ? i : max), 0);

	const joinedRowHints = rowHints.map((x) => x.join(' '));
	const maxRowHintLength = maxLength(joinedRowHints);

	const _colHints = columnHints.map((x) => x.join(' '));
	const maxColHintLength = maxLength(_colHints);
	const colHints = _colHints.map((x) => x.padStart(maxColHintLength).split(''));

	for (let i = 0; i < maxColHintLength; i++) {
		const n = colHints.map((x) => x.shift()).join('');
		result += ''.padStart(maxRowHintLength);
		result += ' ' + n;
		result += '\n';
	}
	result += '\n';

	rows.forEach((content, i) => {
		const art = content
			.map((x) => {
				if (x === -1) {
					return 'x';
				}
				return ['░', '█'][x];
			})
			.join('');
		result += `${joinedRowHints[i].padStart(maxRowHintLength)} ${art}`;
		result += '\n';
	});

	return result;
};

export default draw;
