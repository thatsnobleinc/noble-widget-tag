console.log("[Noble] Noble script loaded 2.0.3");

const BANNER_EXPANDED_HEIGHT = 304;
const BANNER_INITIAL_HEIGHT = 88;

const BANNER_EXPANDED_HEIGHT_STR = BANNER_EXPANDED_HEIGHT + 'px';
const BANNER_INITIAL_HEIGHT_STR = BANNER_INITIAL_HEIGHT + 'px';

let wasIframeOnPrevPage; // boolean to indicate if header was already adjusted on previous navigation
let wasBannerVisibleOnPrevPage;

/**
 * Check if an element is sticky or fixed; and has a top position.
 */
const checkIsTopFixedElement = (computedStyle) => {
	let isTopFixedElement = false;
	const top = computedStyle.top;
	const bottom = computedStyle.bottom;

	if (
		computedStyle.position === "fixed" ||
		computedStyle.position === "sticky"
	) {
		if (bottom === "auto") isTopFixedElement = true;
		else isTopFixedElement = parseFloat(top) < parseFloat(bottom);
	}

	return isTopFixedElement;
};


const adjustBannerHeight = (newHeightStr, heightDiff) => {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");

	if (document.body.style.marginTop != newHeightStr) {
		nobleIframe.style.height = newHeightStr;
		allElements.forEach((element) => {
			const computedStyle = getComputedStyle(element);

			if (element.id === "nobleIframe") return;
			if (checkIsTopFixedElement(computedStyle)) {
				const currentTop = parseInt(computedStyle.top) || 0;
				element.style.top = currentTop + heightDiff + "px";
			}
		});
	}
};

/**
 * Adjust page content for initial, expanded, and collapsed banner
 * */ 
const adjustPageContentInitialBanner = () => {
	adjustBannerHeight(BANNER_INITIAL_HEIGHT_STR, BANNER_INITIAL_HEIGHT);
};


const adjustPageContentExpandedBanner = () => {
	let heightDiff = BANNER_EXPANDED_HEIGHT - BANNER_INITIAL_HEIGHT;
	adjustBannerHeight(BANNER_EXPANDED_HEIGHT_STR, heightDiff);
};

const adjustPageContentCollapseBanner = () => {
	let heightDiff = BANNER_EXPANDED_HEIGHT - BANNER_INITIAL_HEIGHT;
	adjustBannerHeight(BANNER_INITIAL_HEIGHT_STR, -heightDiff);
};



/**
 * Executed on page load
 */
window.addEventListener("load", () => {
	let nobleIframe = document.getElementById("nobleIframe");

	if (nobleIframe) {
		nobleIframe.style.display = "block"; //Force widget to be displayed on mobile devices.
		wasIframeOnPrevPage = true;
	}
});


/**
 * Executed on iframe message post
 */
window.addEventListener("message", function (event) {
	const trustedOrigins = [
		"https://appdev.thatsnoble.com",
		"https://app.thatsnoble.com",
		"https://55e2-68-9-192-22.ngrok-free.app" //TODO: remove this
	];
	const allowedNavigationDomains = [
		"https://dimmo.ai",
		"https://www.dimmo.ai",
		"https://webapp-git-noble-integration-lucas-swartsenburgs-projects.vercel.app",
	];

	// Check if the event.origin is in the list of trusted origins
	if (trustedOrigins.includes(event.origin)) {

		/**
		 * Message to get URL where the widget is embedded
		 */

		if (event.data === "getURL") {
			const iframeURL = window.location.href;
			event.source.postMessage({ iframeURL: iframeURL }, event.origin);
		}

		/**
		 * Message to:
		 * - Change the positions of the top fixed/sticky elements
		 * - Change the whole document body position
		 */
		if (event.data.bannerVisibility === "bannerLoaded") {
			console.log("Banner Loaded")
			wasBannerVisibleOnPrevPage = true;
			adjustPageContentInitialBanner()
			document.body.style.marginTop = BANNER_INITIAL_HEIGHT_STR;

		}

		if (event.data.bannerVisibility === "bannerExpanded") {
			console.log("Banner Expanded")
			adjustPageContentExpandedBanner()
			document.body.style.marginTop = BANNER_EXPANDED_HEIGHT_STR;

		}

		if (event.data.bannerVisibility === "bannerCollapsed") {
			console.log("Banner Loaded")
			adjustPageContentCollapseBanner()
			document.body.style.marginTop = BANNER_INITIAL_HEIGHT_STR;
		}



		/**
		 * Message to redirect parent url
		 */
		if (event.data.parentUrl) {
			const url = new URL(event.data.parentUrl);

			// Check if the URL's origin matches the allowed domains
			if (allowedNavigationDomains.includes(url.origin)) {
				// Redirect safely
				window.location.href = url.href;
			} else {
				console.warn("Untrusted URL origin, skipping navigation:", url.origin);
			}
		}
	} else {
		//Log the case where the origin is not trusted
		// console.warn("Message received from an untrusted origin:", event.origin);
	}
});

/**
 * Adjust page content depending on the banner visibility
 */
// const adjustPageContent = (isBannerVisible, nobleIframe, allElements, marginTop) => {
// 	//Add space for the banner
// 	if (isBannerVisible) {
// 		//Adjust mobile devices
// 		if (window.innerWidth < 640 && document.body.style.marginTop != "116px") {
// 			nobleIframe.style.height = `116px`;

// 			allElements.forEach((element) => {
// 				const computedStyle = getComputedStyle(element);

// 				if (element.id === "nobleIframe") return;
// 				if (checkIsTopFixedElement(computedStyle)) {
// 					const currentTop = parseInt(computedStyle.top) || 0;
// 					element.style.top = currentTop + 116 + "px";
// 				}
// 			});
// 		} else if (document.body.style.marginTop != marginTop) {
// 			//Adjust desktop devices
// 			nobleIframe.style.height = marginTop;
// 			allElements.forEach((element) => {
// 				const computedStyle = getComputedStyle(element);

// 				if (element.id === "nobleIframe") return;
// 				if (checkIsTopFixedElement(computedStyle)) {
// 					const currentTop = parseInt(computedStyle.top) || 0;
// 					element.style.top = currentTop + marginTop;// TODO: double check this
// 				}
// 			});
// 		}
// 	} else {
// 		allElements.forEach((element) => {
// 			const computedStyle = getComputedStyle(element);

// 			if (element.id === "nobleIframe") return;
// 			if (checkIsTopFixedElement(computedStyle)) {
// 				const currentTop = parseInt(computedStyle.top) || 0;
// 				if (window.innerWidth < 640)
// 					element.style.top = currentTop - 116 + "px";
// 				else element.style.top = currentTop - 84 + "px";
// 			}
// 		});
// 	}
// };

/**
 * Check for the iframe on navigation. Revert margins if not there.
 */
// (function () {
// 	const originalPushState = history.pushState;
// 	const originalReplaceState = history.replaceState;

// 	function checkForNoble(url) {
// 		// Create a MutationObserver to wait for the DOM to update
// 		const observer = new MutationObserver((mutations, obs) => {
// 			const nobleIframe = document.getElementById("nobleIframe");

// 			if (nobleIframe) {
// 				//console.log("[Noble] nobleIframe exists.");
// 				wasIframeOnPrevPage = true;
// 				//obs.disconnect(); // Stop observing once the iframe is found
// 			} else if (wasBannerVisibleOnPrevPage) {
// 				console.log(
// 					"[Noble] nobleIframe was not found on current page. Reverting margins."
// 				);
// 				const allElements = document.querySelectorAll("*");
// 				document.body.style.marginTop = "0";

// 				adjustPageContent(false, null, allElements);
// 				wasIframeOnPrevPage = false;
// 				wasBannerVisibleOnPrevPage = false;
// 				obs.disconnect();
// 			}
// 		});

// 		// Start observing the document for changes
// 		observer.observe(document.body, {
// 			childList: true, // Observe direct children
// 			subtree: true, // Observe all descendants
// 		});
// 	}

// 	history.pushState = function (...args) {
// 		originalPushState.apply(this, args);
// 		checkForNoble(args[2]); // URL is the third argument to pushState
// 	};

// 	history.replaceState = function (...args) {
// 		originalReplaceState.apply(this, args);
// 		checkForNoble(args[2]); // URL is the third argument to replaceState
// 	};

// 	window.addEventListener("popstate", function () {
// 		checkForNoble(window.location.href); // URL on popstate
// 	});
// })();