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
		mode = 'pages',
		compactMode = 'auto',
		showJumpToPage = false,
		showProgress = false,
		showPageView = false,
		pageViewOptions = [10, 20, 50, 100],
		pageViewLabel = '',
		syncUrl = false,
		rememberLastPage = false,
		allowKeyboardNavigation = true,
		allowSwipe = false,
		loadingPage = null,
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

	const finalTheme = $derived({ ...defaultTheme, ...theme });

	const pageSize = $derived(currentLength > 0 ? currentLength : 10);
	const totalPages = $derived(Math.max(1, Math.ceil(results / pageSize) || 1));
	const startRecord = $derived(results > 0 ? (currentPage - 1) * pageSize + 1 : 0);
	const endRecord = $derived(Math.min(currentPage * pageSize, results));
	const activeRadius = $derived(
		activeShape === 'circle' ? '999px' : activeShape === 'square' ? '0px' : finalTheme.borderRadius
	);
	const pageButtons = $derived(buildPages(currentPage, totalPages));
	const progressPercent = $derived(
		totalPages <= 1 ? 100 : ((currentPage - 1) / (totalPages - 1)) * 100
	);
	const compactCurrentLabel = $derived(`${currentPage} / ${totalPages}`);

	/*
	  Skeleton page-button count:
	  - compact (mobile): 0 page pills — replaced by one wide compact pill
	  - full: 5 page pills (prev, 5 pages, next = 7 total, matching a typical
	    7-page spread before dots kick in)
	*/

	let isCompact = $state(false);
	let jumpPageValue = $state(String(currentPage));
	let preferencesHydrated = false;
	let touchStartX = 0;
	let touchStartY = 0;
	let touchStartTime = 0;

	const skeletonPageCount = $derived(isCompact ? 0 : 5);

	$effect(() => {
		if (currentLength <= 0) currentLength = 10;
	});

	$effect(() => {
		const nextPage = clampPage(currentPage, totalPages);
		if (nextPage !== currentPage) currentPage = nextPage;
	});

	$effect(() => {
		jumpPageValue = String(currentPage);
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		if (compactMode === 'always') {
			isCompact = true;
			return;
		}
		if (compactMode === 'never') {
			isCompact = false;
			return;
		}

		const query = window.matchMedia('(max-width: 480px)');
		const update = () => {
			isCompact = query.matches;
		};
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		const syncParamName = getSyncParamName();
		const storageKey = getRememberKey();

		if (!preferencesHydrated) {
			preferencesHydrated = true;
			const preferredPage = readPreferredPage(syncParamName, storageKey);
			if (preferredPage !== null) currentPage = clampPage(preferredPage, totalPages);
		}

		if (syncUrl) writePageToUrl(syncParamName, currentPage);
		if (rememberLastPage) writePageToStorage(storageKey, currentPage);
		if (!syncUrl) return;

		const handlePopState = () => {
			const nextPage = readPageFromUrl(syncParamName);
			if (nextPage !== null) currentPage = clampPage(nextPage, totalPages);
		};
		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	});

	$effect(() => {
		if (!allowKeyboardNavigation || typeof window === 'undefined') return;

		const globalKeyHandler = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

			switch (event.key) {
				case 'ArrowLeft':
					event.preventDefault();
					goToPage(currentPage - 1);
					break;
				case 'ArrowRight':
					event.preventDefault();
					goToPage(currentPage + 1);
					break;
				case 'Home':
					event.preventDefault();
					goToPage(1);
					break;
				case 'End':
					event.preventDefault();
					goToPage(totalPages);
					break;
			}
		};

		window.addEventListener('keydown', globalKeyHandler);
		return () => window.removeEventListener('keydown', globalKeyHandler);
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

	function submitJumpPage() {
		const nextPage = Number.parseInt(jumpPageValue, 10);
		if (Number.isNaN(nextPage)) {
			jumpPageValue = String(currentPage);
			return;
		}
		goToPage(nextPage);
		jumpPageValue = String(clampPage(nextPage, totalPages));
	}

	function handlePageViewChange(e: Event) {
		const size = Number((e.target as HTMLSelectElement).value);
		currentLength = size > 0 ? size : 10;
		currentPage = 1;
		onPageChange?.(1);
		onPageViewChange?.(currentLength);
	}

	function handleTouchStart(event: TouchEvent) {
		if (!allowSwipe) return;
		const touch = event.touches[0];
		if (!touch) return;
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		touchStartTime = Date.now();
	}

	function handleTouchEnd(event: TouchEvent) {
		if (!allowSwipe) return;
		const touch = event.changedTouches[0];
		if (!touch) return;
		const deltaX = touch.clientX - touchStartX;
		const deltaY = touch.clientY - touchStartY;
		const elapsed = Date.now() - touchStartTime;
		if (elapsed > 600 || Math.abs(deltaX) < 40 || Math.abs(deltaY) > 35) return;
		deltaX < 0 ? goToPage(currentPage + 1) : goToPage(currentPage - 1);
	}

	function buildPages(current: number, total: number): PaginationPageButton[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

		const pages: PaginationPageButton[] = [1];
		const leftEdge = Math.max(2, current - 1);
		const rightEdge = Math.min(total - 1, current + 1);

		if (leftEdge > 2) pages.push('dots-start');
		for (let i = leftEdge; i <= rightEdge; i++) pages.push(i);
		if (rightEdge < total - 1) pages.push('dots-end');

		pages.push(total);
		return pages;
	}

	function getSyncParamName() {
		return typeof syncUrl === 'string' && syncUrl.trim() ? syncUrl.trim() : 'page';
	}

	function getRememberKey() {
		return typeof rememberLastPage === 'string' && rememberLastPage.trim()
			? rememberLastPage.trim()
			: 'svelte-pagination:last-page';
	}

	function readPreferredPage(paramName: string, storageKey: string) {
		const pageFromUrl = readPageFromUrl(paramName);
		if (pageFromUrl !== null) return pageFromUrl;
		if (!rememberLastPage) return null;
		return readPageFromStorage(storageKey);
	}

	function readPageFromUrl(paramName: string) {
		if (typeof window === 'undefined') return null;
		const value = new URL(window.location.href).searchParams.get(paramName);
		if (!value) return null;
		const parsed = Number.parseInt(value, 10);
		return Number.isFinite(parsed) ? parsed : null;
	}

	function writePageToUrl(paramName: string, page: number) {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.set(paramName, String(page));
		window.history.replaceState({}, '', url);
	}

	function readPageFromStorage(storageKey: string) {
		if (typeof window === 'undefined') return null;
		try {
			const value = window.localStorage.getItem(storageKey);
			if (!value) return null;
			const parsed = Number.parseInt(value, 10);
			return Number.isFinite(parsed) ? parsed : null;
		} catch {
			return null;
		}
	}

	function writePageToStorage(storageKey: string, page: number) {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(storageKey, String(page));
		} catch {
			/* ignore */
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="pagination-wrapper"
	class:is-loading={isLoading}
	role="navigation"
	aria-label="Pagination"
	aria-busy={isLoading}
	tabindex={allowKeyboardNavigation ? 0 : undefined}
	ontouchstart={allowSwipe ? handleTouchStart : undefined}
	ontouchend={allowSwipe ? handleTouchEnd : undefined}
	style="
		--active-bg:      {finalTheme.activeBgColor};
		--active-text:    {finalTheme.activeTextColor};
		--hover-bg:       {finalTheme.hoverBgColor};
		--text-color:     {finalTheme.textColor};
		--disabled-opacity: {finalTheme.disabledOpacity};
		--radius:         {finalTheme.borderRadius};
		--active-radius:  {activeRadius};
		--btn-size:       {finalTheme.buttonSize};
		--font-size:      {finalTheme.fontSize};
	"
>
	{#if isLoading}
		<!--
			Skeleton mirrors only the enabled features.

			Two-layer mobile detection:
			  1. .skeleton-mobile class — set by Svelte's $state isCompact (JS matchMedia, fires instantly)
			  2. CSS @media (width < 30rem / 30–40rem) — pure-CSS fallback for SSR / no-JS

			overflow: visible on .pagination-skeleton prevents the right-side clip
			that was cutting the last skeleton button.
		-->
		<div
			class="pagination-skeleton"
			class:skeleton-mobile={isCompact}
			aria-hidden="true"
			role="status"
			aria-label="Loading pagination"
		>
			<!-- 1. Info area (only when results prop is provided) -->
			{#if showProgress && results > 0}
				<div class="skeleton-progress">
					<div class="skeleton-row skeleton-progress-text"></div>
					<div class="skeleton-row skeleton-progress-bar"></div>
				</div>
			{:else if results > 0}
				<div class="skeleton-row skeleton-info"></div>
			{/if}

			<!-- 2. Controls: always shown -->
			<div class="skeleton-controls">
				<div class="skeleton-pill skeleton-nav"></div>

				{#if isCompact}
					<!-- Compact: one wide pill matching "1 / 25" button -->
					<div class="skeleton-pill skeleton-compact-page"></div>
				{:else}
					{#each Array.from({ length: skeletonPageCount }) as _}
						<div class="skeleton-pill skeleton-page"></div>
					{/each}
				{/if}

				<div class="skeleton-pill skeleton-nav"></div>
			</div>

			<!-- 3. Jump to page (only when enabled and not infinite) -->
			{#if showJumpToPage && mode !== 'infinite'}
				<div class="skeleton-jump">
					<div class="skeleton-row skeleton-jump-label"></div>
					<div class="skeleton-pill skeleton-jump-input"></div>
					<div class="skeleton-pill skeleton-jump-go"></div>
				</div>
			{/if}

			<!-- 4. Page view selector (only when enabled) -->
			{#if showPageView}
				<div class="skeleton-page-view">
					<div class="skeleton-pill skeleton-select"></div>
					{#if pageViewLabel}
						<div class="skeleton-row skeleton-label"></div>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<!-- ── Info area ─────────────────────────────────────── -->
		{#if showProgress && results > 0}
			<div class="progress-summary">
				<span class="records-info">
					Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> : Showing
					<strong>{startRecord}–{endRecord}</strong> of <strong>{results}</strong>
				</span>
				<div class="progress-bar" aria-hidden="true">
					<div class="progress-fill" style={`width: ${progressPercent}%`}></div>
				</div>
			</div>
		{:else if results > 0}
			<span class="records-info">
				Showing <strong>{startRecord}–{endRecord}</strong> of <strong>{results}</strong>
			</span>
		{/if}

		<!-- ── Pagination buttons ────────────────────────────── -->
		{#if mode === 'infinite'}
			<div class="pagination-box infinite-box">
				<button
					type="button"
					class="load-more"
					disabled={currentPage >= totalPages}
					onclick={() => goToPage(currentPage + 1)}
					aria-label={currentPage >= totalPages ? 'No more pages to load' : 'Load more results'}
				>
					{#if loadingPage === currentPage + 1}
						<span class="button-spinner" aria-hidden="true"></span>
					{:else if currentPage >= totalPages}
						End reached
					{:else}
						Load more
					{/if}
				</button>
			</div>
		{:else}
			<div
				class="pagination-box"
				class:animated={isAnimated}
				class:hover-shrink={enableHoverShrink}
				class:compact={isCompact}
			>
				<!-- Prev -->
				<button
					type="button"
					class="pre"
					class:string-btn={typeof prev === 'string'}
					disabled={currentPage <= 1}
					onclick={() => goToPage(currentPage - 1)}
					aria-label="Previous page"
				>
					{#if LeftIcon}<LeftIcon size={16} />{/if}
					{#if typeof prev === 'string'}
						<span>{prev}</span>
					{:else if !LeftIcon}
						{'<'}
					{/if}
				</button>

				<!-- Pages -->
				{#if isCompact}
					<button
						type="button"
						class="pagination_number compact-current active"
						disabled={loadingPage === currentPage}
						aria-label="Page {currentPage} of {totalPages}"
						aria-current="page"
					>
						{#if loadingPage === currentPage}
							<span class="button-spinner" aria-hidden="true"></span>
						{:else}
							{compactCurrentLabel}
						{/if}
					</button>
				{:else}
					{#each pageButtons as page (page)}
						{#if page === 'dots-start' || page === 'dots-end'}
							<button class="pagination_number dots" disabled aria-hidden="true">...</button>
						{:else}
							<button
								type="button"
								class="pagination_number"
								class:active={page === currentPage}
								disabled={loadingPage === page}
								onclick={() => goToPage(page)}
								aria-label="Page {page}"
								aria-current={page === currentPage ? 'page' : undefined}
							>
								{#if loadingPage === page}
									<span class="button-spinner" aria-hidden="true"></span>
								{:else}
									{page}
								{/if}
							</button>
						{/if}
					{/each}
				{/if}

				<!-- Next -->
				<button
					type="button"
					class="next"
					class:string-btn={typeof next === 'string'}
					disabled={currentPage >= totalPages}
					onclick={() => goToPage(currentPage + 1)}
					aria-label="Next page"
				>
					{#if typeof next === 'string'}<span>{next}</span>{:else if !RightIcon}{'>'}{/if}
					{#if RightIcon}<RightIcon size={16} />{/if}
				</button>
			</div>
		{/if}

		<!-- ── Jump to page ──────────────────────────────────── -->
		{#if showJumpToPage && mode !== 'infinite'}
			<div class="jump-to-page">
				<span class="jump-label">Go to</span>
				<input
					class="jump-input"
					type="number"
					min="1"
					max={totalPages}
					inputmode="numeric"
					bind:value={jumpPageValue}
					onkeydown={(e) => {
						if (e.key === 'Enter') submitJumpPage();
					}}
					aria-label="Jump to page"
				/>
				<button type="button" class="jump-submit" onclick={submitJumpPage} aria-label="Go to page">
					Go
				</button>
			</div>
		{/if}

		<!-- ── Page view selector ────────────────────────────── -->
		{#if showPageView}
			<div class="page-view-selector">
				<select
					value={currentLength > 0 ? currentLength : 10}
					onchange={handlePageViewChange}
					aria-label="Records per page"
				>
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
