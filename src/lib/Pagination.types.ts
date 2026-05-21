import type { Component } from 'svelte';

export type PaginationShape = 'square' | 'rounded' | 'circle';
export type PaginationMode = 'pages' | 'infinite';
export type PaginationCompactMode = 'auto' | 'always' | 'never';

export type PaginationTheme = Partial<{
	activeBgColor: string;
	activeTextColor: string;
	hoverBgColor: string;
	textColor: string;
	disabledOpacity: number;
	borderRadius: string;
	buttonSize: string;
	fontSize: string;
}>;

export type PaginationPageButton = number | 'dots-start' | 'dots-end';

export interface PaginationProps {
	results?: number;
	currentLength?: number;
	currentPage?: number;
	isLoading?: boolean;
	onPageChange?: ((page: number) => void) | null;
	onPageViewChange?: ((pageSize: number) => void) | null;
	leftIcon?: Component<{ size?: number }> | null;
	rightIcon?: Component<{ size?: number }> | null;
	prev?: string | null;
	next?: string | null;
	isAnimated?: boolean;
	enableHoverShrink?: boolean;
	activeShape?: PaginationShape;
	mode?: PaginationMode;
	compactMode?: PaginationCompactMode;
	showJumpToPage?: boolean;
	showProgress?: boolean;
	showPageView?: boolean;
	pageViewOptions?: number[];
	pageViewLabel?: string;
	syncUrl?: boolean | string;
	rememberLastPage?: boolean | string;
	allowKeyboardNavigation?: boolean;
	allowSwipe?: boolean;
	loadingPage?: number | null;
	theme?: PaginationTheme;
}
