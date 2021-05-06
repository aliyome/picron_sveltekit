<script lang="ts">
	import Fa from 'svelte-fa';
	import { faTimes } from '@fortawesome/free-solid-svg-icons';

	import { cellType } from '$lib/nonogram/types';
	import type { CellType } from '$lib/nonogram/types';

	export let type: CellType;
</script>

{#if type === cellType.Checked}
	<div class="w-full h-full flex items-center justify-center bg-primary-600" />
{/if}

{#if type === cellType.Empty}
	<div class="w-full h-full flex items-center justify-center ">
		<Fa icon={faTimes} />
	</div>
{/if}

{#if type === cellType.Unknown}
	<div class="w-full h-full flex items-center justify-center " />
{/if}

<style>
</style>
