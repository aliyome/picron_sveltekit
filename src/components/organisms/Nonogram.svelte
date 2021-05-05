<script lang="ts">
	import Cell from '$components/atoms/Cell.svelte';

	export let width: number;
	export let height: number;

	const isFirstRow = (i: number) => 0 <= i && i < width;
	const isFirstColumn = (i: number) => i % width === 0;
	const isRulerRow = (i: number) => Math.floor(i / height) % 5 === 0;
	const isRulerColumn = (i: number) => (i % width) % 5 === 0;
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
</script>

<div class="grid" style="--width:{width}; --height:{height};">
	{#each new Array(height * width).fill(1) as type, i}
		<div class="cell {getBorderClass(i)}">
			<Cell {type} />
		</div>
	{/each}
</div>

<style>
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
