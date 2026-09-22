/* ---------------------------------------------------------------------------
   Khincc / Studio — interaction layer
   1. Sticky header state + reading progress
   2. Reveal-on-scroll for [data-reveal]

   Content stays visible when JavaScript is unavailable: the hiding rules live
   behind the .js class that each page adds to <html> in the document head.
--------------------------------------------------------------------------- */
(() => {
	'use strict';

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* 1. Header ------------------------------------------------------------ */
	const header = document.querySelector('.site-header');

	if (header) {
		const setProgress = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight;
			const value = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
			header.style.setProperty('--progress', value.toFixed(4));
		};

		const onScroll = () => {
			header.classList.toggle('is-scrolled', window.scrollY > 16);
			setProgress();
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', setProgress);
	}

	/* 2. Reveal on scroll -------------------------------------------------- */
	// [data-reveal-group] marks a grid/list whose children should reveal one by
	// one, so the markup stays clean and the stagger stays consistent.
	document.querySelectorAll('[data-reveal-group]').forEach((group) => {
		Array.from(group.children).forEach((child) => {
			child.setAttribute('data-reveal', '');
		});
	});

	const targets = Array.from(document.querySelectorAll('[data-reveal]'));

	if (!targets.length) {
		return;
	}

	if (reduceMotion || !('IntersectionObserver' in window)) {
		targets.forEach((el) => el.classList.add('is-visible'));
		return;
	}

	// Gentle stagger for elements that share a parent (grids, lists).
	const seenPerParent = new Map();
	targets.forEach((el) => {
		const seen = seenPerParent.get(el.parentElement) || 0;
		seenPerParent.set(el.parentElement, seen + 1);
		el.style.setProperty('--reveal-delay', Math.min(seen * 0.08, 0.3).toFixed(2) + 's');
	});

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					return;
				}
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			});
		},
		{ rootMargin: '0px 0px -6% 0px', threshold: 0.1 }
	);

	targets.forEach((el) => observer.observe(el));
})();
