<script lang="ts">
	import Cell from '$components/atoms/Cell.svelte';
	// import type Puzzle from '$lib/nonogram/Puzzle';
	import Puzzle from '$lib/nonogram/Puzzle';
	import type Strategy from '$lib/nonogram/Strategy';
	import type { CellType } from '$lib/nonogram/types';
	import { cellType } from '$lib/nonogram/types';

	export let puzzle: Puzzle;
	export let strategy: Strategy;
	let isSolved: boolean = puzzle.isSolved;

	const isFirstRow = (i: number) => 0 <= i && i < puzzle.width;
	const isFirstColumn = (i: number) => i % puzzle.width === 0;
	const isRulerRow = (i: number) => Math.floor(i / puzzle.height) % 5 === 0;
	const isRulerColumn = (i: number) => (i % puzzle.width) % 5 === 0;
	const getBorderClass = (i: number) => {
		const result: string[] = [];
		if (isFirstRow(i)) {
			result.push('border-top');
		}
		if (isFirstColumn(i)) {
			result.push('border-left');
		}
		if (isRulerRow(i) && !isFirstRow(i)) {
			result.push('border-top-thick');
		}
		if (isRulerColumn(i) && !isFirstColumn(i)) {
			result.push('border-left-thick');
		}
		return result.join(' ');
	};

	const onClickCell = (e: MouseEvent, i: number) => {
		const x = i % puzzle.width;
		const y = Math.floor(i / puzzle.height);
		let type: CellType = cellType.Unknown;
		if (e.button === 0) {
			type = cellType.Checked;
		} else {
			type = cellType.Empty;
		}
		puzzle.rows[y][x] = type;

		const tempPuzzle = new Puzzle(puzzle.toJSON());
		strategy.solve(tempPuzzle);
		isSolved = tempPuzzle.isSolved;
	};
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onContextDummy = () => {};
</script>

<div class="layout">
	<!-- topleft space -->
	<div>
		<span>{isSolved ? '🙆‍♂️' : '🙅‍♂️'}</span>
	</div>

	<!-- top hint row -->
	<div class="hint-row" style="--width:{puzzle.width}; --height:1;">
		{#each puzzle.columnHints as hints, x}
			<div
				class="hint-cell flex flex-col items-center justify-end leading-none {getBorderClass(x)}"
			>
				{#each hints as hint, y}
					<div>{hint}</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- left hint column -->
	<div>
		<div class="hint-col" style="--width:{1}; --height:{puzzle.height};">
			{#each puzzle.rowHints as hints, y}
				<div class="hint-cell flex items-center justify-end leading-none border-left border-top">
					{#each hints as hint, x}
						<div>{hint}</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<!-- down right nonogram grid -->
	<div class="grid" style="--width:{puzzle.width}; --height:{puzzle.height};">
		{#each puzzle.state as type, i}
			<div
				class="cell {getBorderClass(i)}"
				on:mousedown|preventDefault|stopPropagation={(e) => onClickCell(e, i)}
				on:contextmenu|preventDefault|stopPropagation={onContextDummy}
			>
				<Cell {type} />
			</div>
		{/each}
	</div>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto 1fr;
	}

	.hint-row {
		--border: 1px solid black;
		--border-thick: 2px solid black;
		--size: 20px;

		display: grid;
		grid-template-columns: repeat(var(--width), var(--size));
		grid-template-rows: auto;
	}

	.hint-col {
		--border: 1px solid black;
		--border-thick: 2px solid black;
		--size: 20px;

		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: repeat(var(--height), var(--size));
	}
	.hint-cell {
		border-right: var(--border);
		border-bottom: var(--border);
		width: 100%;
		height: 100%;
		line-height: 0.9;
	}

	.grid {
		--border: 1px solid black;
		--border-thick: 2px solid black;
		--size: 20px;

		display: grid;
		grid-template-columns: repeat(var(--width), var(--size));
		grid-template-rows: repeat(var(--height), var(--size));
	}

	.cell {
		border-right: var(--border);
		border-bottom: var(--border);
		width: 100%;
		height: 100%;
	}
	.border-left {
		border-left: var(--border);
	}
	.border-top {
		border-top: var(--border);
	}
	.border-left-thick {
		border-left: var(--border-thick);
	}
	.border-top-thick {
		border-top: var(--border-thick);
	}
</style>
