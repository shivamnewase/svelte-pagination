<script lang="ts">
	import type { PaginationPageButton, PaginationProps } from './Pagination.types.js';
	import './Pagination.style.css';

	type Props = PaginationProps;

	let {
		results = 0,
		currentLength = $bindable(10),
		currentPage = $bindable(1),
		isLoading = false,
		onPageChange = null,
		onPageViewChange = null,
		leftIcon: LeftIcon = null,
		rightIcon: RightIcon = null,
		prev = null,
		next = null,
		isAnimated = false,
		enableHoverShrink = false,
		activeShape = 'rounded',
		showPageView = false,
		pageViewOptions = [10, 20, 50, 100],
		pageViewLabel = '',
		theme = {}
	}: Props = $props();

	const defaultTheme = {
		activeBgColor: '#0f172a',
		activeTextColor: '#ffffff',
		hoverBgColor: '#e5e7eb',
		textColor: '#111827',
		disabledOpacity: 0.4,
		borderRadius: '6px',
		buttonSize: '40px',
		fontSize: '14px'
	};

	const finalTheme = $derived({
		...defaultTheme,
		...theme
	});

	const pageSize = $derived(currentLength > 0 ? currentLength : 10);

	const totalPages = $derived(Math.max(1, Math.ceil(results / pageSize) || 1));
	const startRecord = $derived(results > 0 ? (currentPage - 1) * pageSize + 1 : 0);
	const endRecord = $derived(Math.min(currentPage * pageSize, results));

	const activeRadius = $derived(
		activeShape === 'circle' ? '999px' : activeShape === 'square' ? '0px' : finalTheme.borderRadius
	);

	const pageButtons = $derived(buildPages(currentPage, totalPages));
	const skeletonButtonCount = $derived(pageViewLabel ? 5 : 4);

	$effect(() => {
		if (currentLength <= 0) {
			currentLength = 10;
		}
	});

	$effect(() => {
		const nextPage = clampPage(currentPage, totalPages);
		if (nextPage !== currentPage) {
			currentPage = nextPage;
		}
	});

	function clampPage(page: number, total: number) {
		return Math.min(Math.max(1, page), total);
	}

	function goToPage(page: number) {
		const nextPage = clampPage(page, totalPages);
		if (nextPage === currentPage) return;
		currentPage = nextPage;
		onPageChange?.(nextPage);
	}

	function handlePageViewChange(e: Event) {
		const size = Number((e.target as HTMLSelectElement).value);
		currentLength = size > 0 ? size : 10;
		currentPage = 1;
		onPageChange?.(1);
		onPageViewChange?.(currentLength);
	}

	function buildPages(current: number, total: number): PaginationPageButton[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const pages: PaginationPageButton[] = [1];
		const leftEdge = Math.max(2, current - 1);
		const rightEdge = Math.min(total - 1, current + 1);

		if (leftEdge > 2) pages.push('dots-start');
		for (let i = leftEdge; i <= rightEdge; i++) pages.push(i);
		if (rightEdge < total - 1) pages.push('dots-end');

		pages.push(total);
		return pages;
	}
</script>

<div
	class="pagination-wrapper"
	class:is-loading={isLoading}
	aria-busy={isLoading}
	style="
		--active-bg: {finalTheme.activeBgColor};
		--active-text: {finalTheme.activeTextColor};
		--hover-bg: {finalTheme.hoverBgColor};
		--text-color: {finalTheme.textColor};
		--disabled-opacity: {finalTheme.disabledOpacity};
		--radius: {finalTheme.borderRadius};
		--active-radius: {activeRadius};
		--btn-size: {finalTheme.buttonSize};
		--font-size: {finalTheme.fontSize};
	"
>
	{#if isLoading}
		<div class="pagination-skeleton" aria-hidden="true">
			<div class="skeleton-row skeleton-info"></div>
			<div class="pagination-box skeleton-controls">
				<div class="skeleton-pill skeleton-nav"></div>
				{#each Array.from({ length: skeletonButtonCount }) as _, index}
					<div class="skeleton-pill skeleton-page" style={`--skeleton-index: ${index}`}></div>
				{/each}
				<div class="skeleton-pill skeleton-nav"></div>
			</div>
			{#if showPageView}
				<div class="page-view-selector skeleton-page-view">
					<div class="skeleton-pill skeleton-select"></div>
					<div class="skeleton-pill skeleton-label"></div>
				</div>
			{/if}
		</div>
	{:else}
		{#if results > 0}
			<span class="records-info">
				Showing <strong>{startRecord}-{endRecord}</strong> of <strong>{results}</strong>
			</span>
		{/if}

		<div class="pagination-box" class:animated={isAnimated} class:hover-shrink={enableHoverShrink}>
			<button
				type="button"
				class="pre"
				class:string-btn={typeof prev === 'string'}
				disabled={currentPage <= 1}
				onclick={() => goToPage(currentPage - 1)}
				aria-label="Previous page"
			>
				{#if LeftIcon}
					<LeftIcon size={16} />
				{/if}
				{#if typeof prev === 'string'}
					<span>{prev}</span>
				{:else if !LeftIcon}
					{'<'}
				{/if}
			</button>

			{#each pageButtons as page (page)}
				{#if page === 'dots-start' || page === 'dots-end'}
					<button class="pagination_number dots" disabled aria-hidden="true">...</button>
				{:else}
					<button
						type="button"
						class="pagination_number"
						class:active={page === currentPage}
						onclick={() => goToPage(page)}
						aria-label="Page {page}"
						aria-current={page === currentPage ? 'page' : undefined}
					>
						{page}
					</button>
				{/if}
			{/each}

			<button
				type="button"
				class="next"
				class:string-btn={typeof next === 'string'}
				disabled={currentPage >= totalPages}
				onclick={() => goToPage(currentPage + 1)}
				aria-label="Next page"
			>
				{#if typeof next === 'string'}
					<span>{next}</span>
				{:else if !RightIcon}
					{'>'}
				{/if}
				{#if RightIcon}
					<RightIcon size={16} />
				{/if}
			</button>
		</div>

		{#if showPageView}
			<div class="page-view-selector">
				<select value={currentLength > 0 ? currentLength : 10} onchange={handlePageViewChange} aria-label="Records per page">
					{#each pageViewOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
				{#if pageViewLabel}
					<span class="page-view-label">{pageViewLabel}</span>
				{/if}
			</div>
		{/if}
	{/if}
</div>
