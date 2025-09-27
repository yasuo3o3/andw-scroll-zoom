/**
 * ANDW Scroll Zoom - JavaScript
 * スクロール連動拡大/縮小エフェクトの制御
 */

(function() {
	'use strict';

	// prefers-reduced-motionチェック
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (prefersReducedMotion) {
		return;
	}

	// IntersectionObserver対応チェック
	if (!window.IntersectionObserver) {
		console.warn('ANDW Scroll Zoom: IntersectionObserver not supported');
		return;
	}

	// IntersectionObserverプール（設定キーごとに管理）
	const observerPool = new Map();

	// MutationObserver（動的要素監視用）
	let mutationObserver;

	// 初期化済み要素のWeakSet
	const initializedElements = new WeakSet();

	/**
	 * 要素から設定値を取得
	 * @param {Element} element 対象要素
	 * @param {Element|null} parent 親要素（グループの場合）
	 * @returns {Object} 設定オブジェクト
	 */
	function getElementConfig(element, parent = null) {
		const config = {
			mode: 'out',
			from: 0.92,
			to: 1.0,
			threshold: 1.0,
			rootMargin: '0px',
			repeat: true,
			media: null
		};

		// 親の設定を継承
		if (parent) {
			const parentData = parent.dataset;
			if (parentData.andwZoomMode) config.mode = parentData.andwZoomMode;
			if (parentData.andwZoomFrom) config.from = parseFloat(parentData.andwZoomFrom) || config.from;
			if (parentData.andwZoomTo) config.to = parseFloat(parentData.andwZoomTo) || config.to;
			if (parentData.andwThreshold) config.threshold = parseFloat(parentData.andwThreshold) || config.threshold;
			if (parentData.andwRootMargin) config.rootMargin = parentData.andwRootMargin;
			if (parentData.andwRepeat) config.repeat = parentData.andwRepeat === 'true';
			if (parentData.andwMedia) config.media = parentData.andwMedia;
		}

		// 子の設定で上書き
		const elementData = element.dataset;
		if (elementData.andwZoomMode) config.mode = elementData.andwZoomMode;
		if (elementData.andwZoomFrom) config.from = parseFloat(elementData.andwZoomFrom) || config.from;
		if (elementData.andwZoomTo) config.to = parseFloat(elementData.andwZoomTo) || config.to;
		if (elementData.andwThreshold) config.threshold = parseFloat(elementData.andwThreshold) || config.threshold;
		if (elementData.andwRootMargin) config.rootMargin = elementData.andwRootMargin;
		if (elementData.andwRepeat) config.repeat = elementData.andwRepeat === 'true';
		if (elementData.andwMedia) config.media = elementData.andwMedia;

		// 値の検証とフォールバック
		if (config.threshold < 0 || config.threshold > 1) {
			console.warn('ANDW Scroll Zoom: Invalid threshold value, using default 1.0');
			config.threshold = 1.0;
		}

		if (config.from < 0 || config.from > 5) {
			console.warn('ANDW Scroll Zoom: Invalid from value, using default 0.92');
			config.from = 0.92;
		}

		if (config.to < 0 || config.to > 5) {
			console.warn('ANDW Scroll Zoom: Invalid to value, using default 1.0');
			config.to = 1.0;
		}

		return config;
	}

	/**
	 * CSS変数を設定
	 * @param {Element} element 対象要素
	 * @param {Object} config 設定オブジェクト
	 */
	function setCSSVariables(element, config) {
		element.style.setProperty('--andw-zoom-from', config.from);
		element.style.setProperty('--andw-zoom-to', config.to);
	}

	/**
	 * IntersectionObserverのキーを生成
	 * @param {Object} config 設定オブジェクト
	 * @returns {string} キー文字列
	 */
	function getObserverKey(config) {
		return `${config.threshold}_${config.rootMargin}_${config.repeat}`;
	}

	/**
	 * IntersectionObserverを取得または作成
	 * @param {Object} config 設定オブジェクト
	 * @returns {IntersectionObserver} オブザーバー
	 */
	function getOrCreateObserver(config) {
		const key = getObserverKey(config);

		if (observerPool.has(key)) {
			return observerPool.get(key);
		}

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const element = entry.target;
				const elementConfig = element._andwZoomConfig;

				if (!elementConfig) return;

				if (entry.isIntersecting) {
					// 画面に入った場合
					if (elementConfig.mode === 'out') {
						element.classList.remove('andw-zoom-init');
						element.classList.add('andw-zoom-active');
					} else {
						element.classList.remove('andw-zoom-active');
						element.classList.add('andw-zoom-init');
					}
				} else {
					// 画面から出た場合（repeatがtrueの場合のみ戻す）
					if (elementConfig.repeat) {
						if (elementConfig.mode === 'out') {
							element.classList.remove('andw-zoom-active');
							element.classList.add('andw-zoom-init');
						} else {
							element.classList.remove('andw-zoom-init');
							element.classList.add('andw-zoom-active');
						}
					}
				}
			});
		}, {
			threshold: config.threshold,
			rootMargin: config.rootMargin
		});

		observerPool.set(key, observer);
		return observer;
	}

	/**
	 * 要素を初期化してオブザーバーに登録
	 * @param {Element} element 対象要素
	 * @param {Element|null} parent 親要素
	 */
	function initializeElement(element, parent = null) {
		// 既に初期化済みかチェック
		if (initializedElements.has(element)) {
			return;
		}

		// data-andw-zoom="off"の場合は除外
		if (element.dataset.andwZoom === 'off') {
			return;
		}

		// 画像の場合、寸法が確定しているかチェック
		if (element.tagName === 'IMG') {
			const hasSize = element.naturalWidth > 0 && element.naturalHeight > 0;
			const hasCSS = element.style.width || element.style.height ||
							getComputedStyle(element).aspectRatio !== 'auto';

			if (!hasSize && !hasCSS) {
				console.warn('ANDW Scroll Zoom: Image without dimensions detected, skipping to avoid CLS');
				return;
			}
		}

		const config = getElementConfig(element, parent);

		// メディアクエリチェック
		if (config.media && !window.matchMedia(config.media).matches) {
			return;
		}

		// 設定を要素に保存
		element._andwZoomConfig = config;

		// CSS変数設定
		setCSSVariables(element, config);

		// 初期クラス設定
		if (config.mode === 'out') {
			element.classList.add('andw-zoom-init');
		} else {
			element.classList.add('andw-zoom-active');
		}

		// オブザーバーに登録
		const observer = getOrCreateObserver(config);
		observer.observe(element);

		// 初期化済みマーク
		initializedElements.add(element);
	}

	/**
	 * 対象要素をスキャンして初期化
	 */
	function scanAndInitialize() {
		// 個別指定要素
		const directElements = document.querySelectorAll('.andw-zoom, [data-andw-zoom]:not([data-andw-zoom="off"])');
		directElements.forEach(element => {
			initializeElement(element);
		});

		// グループ指定要素
		const groupElements = document.querySelectorAll('.andw-zoom-group');
		groupElements.forEach(group => {
			const images = group.querySelectorAll('img');
			images.forEach(img => {
				initializeElement(img, group);
			});
		});
	}

	/**
	 * MutationObserverセットアップ（動的要素監視）
	 */
	function setupMutationObserver() {
		if (mutationObserver) {
			return;
		}

		mutationObserver = new MutationObserver((mutations) => {
			let shouldScan = false;

			mutations.forEach((mutation) => {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const element = node;

							// 追加された要素が対象かチェック
							if (element.classList.contains('andw-zoom') ||
								element.classList.contains('andw-zoom-group') ||
								element.hasAttribute('data-andw-zoom') ||
								element.querySelector('.andw-zoom, .andw-zoom-group, [data-andw-zoom]')) {
								shouldScan = true;
							}
						}
					});
				}
			});

			if (shouldScan) {
				// 少し遅延させて確実に DOM が更新されてからスキャン
				setTimeout(scanAndInitialize, 100);
			}
		});

		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

	/**
	 * 初期化メイン処理
	 */
	function init() {
		// 初回スキャン
		scanAndInitialize();

		// MutationObserver セットアップ
		setupMutationObserver();

		// メディアクエリ変更の監視
		const mediaQueryLists = [];
		document.querySelectorAll('[data-andw-media]').forEach(element => {
			const mediaQuery = element.dataset.andwMedia;
			if (mediaQuery && !mediaQueryLists.includes(mediaQuery)) {
				mediaQueryLists.push(mediaQuery);
				const mql = window.matchMedia(mediaQuery);
				mql.addListener(() => {
					// メディアクエリ変更時は全体を再初期化
					// 既存のオブザーバーをクリーンアップ
					observerPool.forEach(observer => observer.disconnect());
					observerPool.clear();

					// 再スキャン
					setTimeout(scanAndInitialize, 100);
				});
			}
		});
	}

	// DOM Ready後に初期化
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	// ページ表示時の再初期化（bfcache対応）
	window.addEventListener('pageshow', (event) => {
		if (event.persisted) {
			setTimeout(scanAndInitialize, 100);
		}
	});

})();