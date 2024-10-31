console.log("[Noble] Noble script loaded 2.0.1");




const BANNER_EXPANDED_HEIGHT = 300;
const BANNER_INITIAL_HEIGHT = 88;

const BANNER_EXPANDED_HEIGHT_STR = BANNER_EXPANDED_HEIGHT + 'px';
const BANNER_INITIAL_HEIGHT_STR = BANNER_INITIAL_HEIGHT + 'px';

let originalPositions;
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

/**
 * Adjust page content depending on the banner visibility
 */
const adjustPageContent = (isBannerVisible, nobleIframe, allElements, marginTop) => {
	//Add space for the banner
	if (isBannerVisible) {
		//Adjust mobile devices
		if (window.innerWidth < 640 && document.body.style.marginTop != "116px") {
			nobleIframe.style.height = `116px`;

			allElements.forEach((element) => {
				const computedStyle = getComputedStyle(element);

				if (element.id === "nobleIframe") return;
				if (checkIsTopFixedElement(computedStyle)) {
					const currentTop = parseInt(computedStyle.top) || 0;
					element.style.top = currentTop + 116 + "px";
				}
			});
		} else if (document.body.style.marginTop != marginTop) {
			//Adjust desktop devices
			nobleIframe.style.height = marginTop;
			allElements.forEach((element) => {
				const computedStyle = getComputedStyle(element);

				if (element.id === "nobleIframe") return;
				if (checkIsTopFixedElement(computedStyle)) {
					const currentTop = parseInt(computedStyle.top) || 0;
					element.style.top = currentTop + marginTop;// TODO: double check this
				}
			});
		}
	} else {
		allElements.forEach((element) => {
			const computedStyle = getComputedStyle(element);

			if (element.id === "nobleIframe") return;
			if (checkIsTopFixedElement(computedStyle)) {
				const currentTop = parseInt(computedStyle.top) || 0;
				if (window.innerWidth < 640)
					element.style.top = currentTop - 116 + "px";
				else element.style.top = currentTop - 84 + "px";
			}
		});
	}
};

const adjustPageContentInitialBanner = () => {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");

	//Adjust mobile devices
	if (window.innerWidth < 640 && document.body.style.marginTop != "116px") {
		nobleIframe.style.height = `116px`;

		allElements.forEach((element) => {
			const computedStyle = getComputedStyle(element);

			if (element.id === "nobleIframe") return;
			if (checkIsTopFixedElement(computedStyle)) {
				const currentTop = parseInt(computedStyle.top) || 0;
				element.style.top = currentTop + 116 + "px";
			}
		});
	} else if (document.body.style.marginTop != BANNER_INITIAL_HEIGHT_STR) {
		//Adjust desktop devices
		nobleIframe.style.height = BANNER_INITIAL_HEIGHT_STR;
		allElements.forEach((element) => {
			const computedStyle = getComputedStyle(element);

			if (element.id === "nobleIframe") return;
			if (checkIsTopFixedElement(computedStyle)) {
				const currentTop = parseInt(computedStyle.top) || 0;
				element.style.top = currentTop + BANNER_INITIAL_HEIGHT_STR;
			}
		});
	}
};

const adjustPageContentExpandedBanner = () => {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");

	let heightDiff = BANNER_EXPANDED_HEIGHT - BANNER_INITIAL_HEIGHT
	let heightDiffStr = heightDiff + "px"

	//Adjust mobile devices
	if (window.innerWidth < 640 && document.body.style.marginTop != "116px") {
		nobleIframe.style.height = `116px`;

		allElements.forEach((element) => {
			const computedStyle = getComputedStyle(element);

			if (element.id === "nobleIframe") return;
			if (checkIsTopFixedElement(computedStyle)) {
				const currentTop = parseInt(computedStyle.top) || 0;
				element.style.top = currentTop + 116 + "px";
			}
		});
	} else if (document.body.style.marginTop != heightDiffStr) {
		//Adjust desktop devices
		nobleIframe.style.height = BANNER_EXPANDED_HEIGHT_STR;
		allElements.forEach((element) => {
			const computedStyle = getComputedStyle(element);

			if (element.id === "nobleIframe") return;
			if (checkIsTopFixedElement(computedStyle)) {
				const currentTop = parseInt(computedStyle.top) || 0;
				console.log(currentTop)
				console.log(heightDiff)

				element.style.top = currentTop + heightDiff + "px";
			}
		});
	}
};

/**
 * Check for the iframe on navigation. Revert margins if not there.
 */
(function () {
	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;

	function checkForNoble(url) {
		// Create a MutationObserver to wait for the DOM to update
		const observer = new MutationObserver((mutations, obs) => {
			const nobleIframe = document.getElementById("nobleIframe");

			if (nobleIframe) {
				//console.log("[Noble] nobleIframe exists.");
				wasIframeOnPrevPage = true;
				//obs.disconnect(); // Stop observing once the iframe is found
			} else if (wasBannerVisibleOnPrevPage) {
				console.log(
					"[Noble] nobleIframe was not found on current page. Reverting margins."
				);
				const allElements = document.querySelectorAll("*");
				document.body.style.marginTop = "0";

				adjustPageContent(false, null, allElements);
				wasIframeOnPrevPage = false;
				wasBannerVisibleOnPrevPage = false;
				obs.disconnect();
			}
		});

		// Start observing the document for changes
		observer.observe(document.body, {
			childList: true, // Observe direct children
			subtree: true, // Observe all descendants
		});
	}

	history.pushState = function (...args) {
		originalPushState.apply(this, args);
		checkForNoble(args[2]); // URL is the third argument to pushState
	};

	history.replaceState = function (...args) {
		originalReplaceState.apply(this, args);
		checkForNoble(args[2]); // URL is the third argument to replaceState
	};

	window.addEventListener("popstate", function () {
		checkForNoble(window.location.href); // URL on popstate
	});
})();

/**
 * Resize iframe depending on the window size for responsiveness
 */
const iframeResize = (isBanner, height) => {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");

	// Post the window width to the iframe
	nobleIframe.contentWindow.postMessage(
		{ windowWidth: window.innerWidth },
		"*"
	);

	//Adjust content if banner is visible
	if (isBanner) adjustPageContent(true, nobleIframe, allElements, height);
};

/**
 * Executed on page load
 */
window.addEventListener("load", () => {
	let nobleIframe = document.getElementById("nobleIframe");
	nobleIframe.style.display = "block"; //Force widget to be displayed on mobile devices.

	if (nobleIframe) {
		wasIframeOnPrevPage = true;
	}
});

/**
 * Executed on page resizing
 */
window.addEventListener("resize", () => iframeResize(false));

/**
 * Executed on iframe message post
 */
window.addEventListener("message", function (event) {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");
	const trustedOrigins = [
		"https://appdev.thatsnoble.com",
		"https://app.thatsnoble.com",
		"https://1236-68-9-192-22.ngrok-free.app" //TODO: remove this
	];
	const allowedNavigationDomains = [
		"https://dimmo.ai",
		"https://www.dimmo.ai",
		"https://webapp-git-noble-integration-lucas-swartsenburgs-projects.vercel.app",
	];

	// Check if the event.origin is in the list of trusted origins
	if (trustedOrigins.includes(event.origin)) {
		/**
		 * Message to update iframe Height
		 */
		// if (event.data.frameHeight) {
		// 	if (window.innerWidth < 640) {
		// 		nobleIframe.style.height = `100%`;
		// 		nobleIframe.style.minHeight = `620px`;
		// 	} else {
		// 		nobleIframe.style.height = event.data.frameHeight + `px`;

		// 		iframeResize(true, BANNER_INITIAL_HEIGHT_STR);

		// 		if (event.data.frameHeight === 84) nobleIframe.style.minHeight = ``;
		// 	}
		// }

		/**
		 * Message to update iframe Width
		 */
		if (event.data.frameWidth) {
			if (String(event.data.frameWidth).includes("%")) {
				nobleIframe.style.width = event.data.frameWidth;
			} else {
				if (window.innerWidth < 640) nobleIframe.style.width = `100%`;
				else nobleIframe.style.width = event.data.frameWidth + `px`;
			}

			// Post the window width to the iframe
			nobleIframe.contentWindow.postMessage(
				{ windowWidth: window.innerWidth },
				"*"
			);
		}

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
			console.log("Banner Loaded!!")
			if (!event.data.bannerEmbed) {
				wasBannerVisibleOnPrevPage = true;
				// nobleIframe.style.top = "0px";
				// nobleIframe.style.bottom = "auto";
				// nobleIframe.style.left = "0px";
				//iframeResize(true, BANNER_INITIAL_HEIGHT_STR);
				adjustPageContentInitialBanner()

				//Move the body down
				if (window.innerWidth < 640) document.body.style.marginTop = "116px";
				else document.body.style.marginTop = BANNER_INITIAL_HEIGHT_STR;
			} else {
				iframeResize(false);
				nobleIframe.style.margin = "32px auto";

				if (window.innerWidth < 640) nobleIframe.style.height = `116px`;
				else nobleIframe.style.height = BANNER_INITIAL_HEIGHT_STR;
			}
		}

		if (event.data.bannerVisibility === "bannerExpanded") {
			console.log("Banner Expanded")
			if (!event.data.bannerEmbed) {
				// wasBannerVisibleOnPrevPage = true;
				// nobleIframe.style.top = "0px";
				// nobleIframe.style.bottom = "auto";
				// nobleIframe.style.left = "0px";
				adjustPageContentExpandedBanner()
				//Move the body down
				if (window.innerWidth < 640) document.body.style.marginTop = "116px";
				else document.body.style.marginTop = BANNER_EXPANDED_HEIGHT_STR;
			} else {
				iframeResize(false);
				nobleIframe.style.margin = "32px auto";

				if (window.innerWidth < 640) nobleIframe.style.height = `116px`;
				else nobleIframe.style.height = BANNER_EXPANDED_HEIGHT_STR;
			}
		}



		/**
		 * Message to:
		 * - Change the positions of the top fixed/sticky elements back to original
		 * - Change the whole document body position  back to original
		 */
		if (event.data.bannerVisibility === "bannerMinimized") {
			nobleIframe.style.width = "0px";
			nobleIframe.style.height = "0px";

			if (!event.data.bannerEmbed) {
				wasBannerVisibleOnPrevPage = false;
				//Move the body back to 0 and remove the iframe
				document.body.style.marginTop = "0";
				nobleIframe.style.top = originalPositions
					? originalPositions.top
					: "80px";
				nobleIframe.style.bottom = originalPositions
					? originalPositions.bottom
					: "auto";
				nobleIframe.style.left = originalPositions
					? originalPositions.left
					: "0px";
				nobleIframe.style.right = originalPositions
					? originalPositions.right
					: "auto";

				adjustPageContent(false, null, allElements);
			} else nobleIframe.style.margin = "32px auto";
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
		console.warn("Message received from an untrusted origin:", event.origin);
	}
});
