<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import Pagination from '../lib/Pagination.svelte';
	import PaginationLeftIcon from './PaginationLeftIcon.svelte';
	import PaginationRightIcon from './PaginationRightIcon.svelte';

	const { Story } = defineMeta({
		title: 'Components/Pagination',
		component: Pagination,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			results: 248,
			currentLength: 10,
			currentPage: 1,
			isLoading: false,
			onPageChange: fn(),
			onPageViewChange: fn(),
			prev: null,
			next: null,
			leftIcon: null,
			rightIcon: null,
			isAnimated: false,
			enableHoverShrink: false,
			activeShape: 'rounded',
			showPageView: false,
			pageViewOptions: [10, 20, 50, 100],
			pageViewLabel: 'per page',
			theme: {
				activeBgColor: '#0f172a',
				activeTextColor: '#ffffff',
				hoverBgColor: '#e5e7eb',
				textColor: '#111827',
				disabledOpacity: 0.4,
				borderRadius: '10px',
				buttonSize: '40px',
				fontSize: '14px'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		results: 248,
		currentLength: 10,
		currentPage: 1
	}}
/>

<Story
	name="Animated Compact"
	args={{
		results: 128,
		currentLength: 20,
		currentPage: 3,
		isAnimated: true,
		enableHoverShrink: true,
		prev: 'Previous',
		next: 'Next',
		showPageView: true,
		pageViewLabel: 'rows'
	}}
/>

<Story
	name="Square Theme"
	args={{
		results: 96,
		currentLength: 12,
		currentPage: 4,
		activeShape: 'square',
		theme: {
			activeBgColor: '#2563eb',
			activeTextColor: '#ffffff',
			hoverBgColor: '#dbeafe',
			textColor: '#1e3a8a',
			borderRadius: '4px',
			buttonSize: '36px'
		}
	}}
/>

<Story
	name="With Icons"
	args={{
		results: 186,
		currentLength: 15,
		currentPage: 2,
		leftIcon: PaginationLeftIcon,
		rightIcon: PaginationRightIcon,
		prev: 'Back',
		next: 'Forward',
		showPageView: true,
		pageViewLabel: 'items'
	}}
/>

<Story
	name="Loading Skeleton"
	args={{
		isLoading: true,
		showPageView: true,
		pageViewLabel: 'items per page'
	}}
/>
