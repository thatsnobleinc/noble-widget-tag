console.log("[Noble] Noble script loaded 1.0.24");

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
const adjustPageContent = (isBannerVisible, nobleIframe, allElements) => {
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
		} else if (document.body.style.marginTop != "100px") {
			//Adjust desktop devices
			nobleIframe.style.height = `100px`;
			allElements.forEach((element) => {
				const computedStyle = getComputedStyle(element);

				if (element.id === "nobleIframe") return;
				if (checkIsTopFixedElement(computedStyle)) {
					const currentTop = parseInt(computedStyle.top) || 0;
					element.style.top = currentTop + 60 + "px";
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
				else element.style.top = currentTop - 60 + "px";
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
const iframeResize = (isBanner) => {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");

	// Post the window width to the iframe
	nobleIframe.contentWindow.postMessage(
		{ windowWidth: window.innerWidth },
		"*"
	);

	//Adjust content if banner is visible
	if (isBanner) adjustPageContent(true, nobleIframe, allElements);
};

/**
 * Executed on page load
 */
window.addEventListener("load", () => {
	let nobleIframe = document.getElementById("nobleIframe");
	nobleIframe.style.display = "block"; //Force widget to be displayed on mobile devices.

	if (nobleIframe) {
		wasIframeOnPrevPage = true;

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
		} else if (document.body.style.marginTop != "100px") {
			//Adjust desktop devices
			nobleIframe.style.height = `100px`;
			allElements.forEach((element) => {
				const computedStyle = getComputedStyle(element);

				if (element.id === "nobleIframe") return;
				if (checkIsTopFixedElement(computedStyle)) {
					const currentTop = parseInt(computedStyle.top) || 0;
					element.style.top = currentTop + 100 + "px";
				}
			});
		}
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
	
	const trustedOrigins = [
		"https://appdev.thatsnoble.com",
		"https://app.thatsnoble.com"
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
		if (event.data.frameHeight) {
			if (window.innerWidth < 640 && event.data.frameHeight != 60) {
				nobleIframe.style.height = `100%`;
				nobleIframe.style.minHeight = `620px`;
			} else {
				nobleIframe.style.height = event.data.frameHeight + `px`;

				if (event.data.frameHeight === 60) nobleIframe.style.minHeight = ``;
			}
		}


		/**
		 * Message to get URL where the widget is embedded
		 */

		if (event.data === "getURL") {
			const iframeURL = window.location.href;
			event.source.postMessage({ iframeURL: iframeURL }, event.origin);
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
		// Log the case where the origin is not trusted
		console.warn("Message received from an untrusted origin:", event.origin);
	}
});
