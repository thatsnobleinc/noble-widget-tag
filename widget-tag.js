console.log("[Noble] Noble script loaded 1.0.17");

let originalPositions;
let wasIframeOnPrevPage; // boolean to indicate if header was already adjusted on previous navigation
let wasBannerVisibleOnPrevPage;

// Check for the iframe on navigation. Revert margins if not there.
(function () {
	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;

	function checkForNoble(url) {
		// // Log the URL
		// console.log('URL changed to:', url);
		// console.log('was noble on prev page?:', wasIframeOnPrevPage);

		// Create a MutationObserver to wait for the DOM to update
		const observer = new MutationObserver((mutations, obs) => {
			const element = document.getElementById("nobleIframe");
			if (element) {
				console.log("nobleIframe exists.");
				wasIframeOnPrevPage = true;
				obs.disconnect(); // Stop observing once the iframe is found
			} else if (wasBannerVisibleOnPrevPage) {
				console.log(
					"nobleIframe was not found on current page. Reverting margins."
				);

				const allElements = document.querySelectorAll("*");

				document.body.style.marginTop = "0";https://webapp-git-noble-integratio-c3ddc7-lucas-swartsenburgs-projects.vercel.app

				if (window.innerWidth < 640) {
					allElements.forEach((element) => {
						// Ignore our iframe
						if (element.id === "nobleIframe") return;

						// Get the computed style of each element
						const computedStyle = getComputedStyle(element);

						// Check if the element is fixed or sticky
						if (
							(computedStyle.position === "fixed" ||
								computedStyle.position === "sticky") &&
							parseInt(computedStyle.top) < parseInt(computedStyle.bottom)
						) {
							// Adjust back the top position
							const currentTop = parseInt(computedStyle.top) || 0;
							element.style.top = currentTop - 116 + "px";
							wasIframeOnPrevPage = false;
							wasBannerVisibleOnPrevPage = false;
							obs.disconnect();
						}
					});
				} else {
					allElements.forEach((element) => {
						// Ignore our iframe
						if (element.id === "nobleIframe") return;

						// Get the computed style of each element
						const computedStyle = getComputedStyle(element);

						// Check if the element is fixed or sticky
						if (
							(computedStyle.position === "fixed" ||
								computedStyle.position === "sticky") &&
							parseInt(computedStyle.top) < parseInt(computedStyle.bottom)
						) {
							// Adjust back the top position
							const currentTop = parseInt(computedStyle.top) || 0;
							element.style.top = currentTop - 60 + "px";
							wasIframeOnPrevPage = false;
							wasBannerVisibleOnPrevPage = false;
							obs.disconnect();
						}
					});
				}
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

// Resize iframe depending on the window size for responsiveness
const iframeResize = (isBanner) => {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");

	// Post the window width to the iframe
	nobleIframe.contentWindow.postMessage(
		{ windowWidth: window.innerWidth },
		"*"
	);

	if (isBanner) {
		if (window.innerWidth < 640) {
			nobleIframe.style.height = `116px`;
			allElements.forEach((element) => {
				// Ignore our iframe
				if (element.id === "nobleIframe") return;

				// Get the computed style of each element
				const computedStyle = getComputedStyle(element);

				// Check if the element is fixed or sticky
				if (
					(computedStyle.position === "fixed" ||
						computedStyle.position === "sticky") &&
					parseInt(computedStyle.top) < parseInt(computedStyle.bottom)
				) {
					// Adjust the top position
					const currentTop = parseInt(computedStyle.top) || 0;
					element.style.top = currentTop + 116 + "px";
				}
			});
		} else {
			nobleIframe.style.height = `60px`;
			allElements.forEach((element) => {
				// Ignore our iframe
				if (element.id === "nobleIframe") return;

				// Get the computed style of each element
				const computedStyle = getComputedStyle(element);

				// Check if the element is fixed or sticky
				if (
					(computedStyle.position === "fixed" ||
						computedStyle.position === "sticky") &&
					parseInt(computedStyle.top) < parseInt(computedStyle.bottom)
				) {
					// Adjust the top position
					const currentTop = parseInt(computedStyle.top) || 0;
					element.style.top = currentTop + 60 + "px";
				}
			});
		}
	}
};

window.addEventListener("load", () => {
	let nobleIframe = document.getElementById("nobleIframe");
	nobleIframe.style.display = "block"; //Force widget to be displayed on mobile devices.

	if (nobleIframe) {
		wasIframeOnPrevPage = true;

		/**
		 * Function to compute the ORIGINAL positions
		 * (top,bottom,right and left) of the iframe
		 */
		const getComputedStyleValue = (element, property) => {
			const value = getComputedStyle(element).getPropertyValue(property);

			if (property === "top") {
				let bottomValue = getComputedStyle(element).getPropertyValue("bottom");
				return value < bottomValue ? value : "auto";
			}

			if (property === "bottom") {
				let topValue = getComputedStyle(element).getPropertyValue("top");
				return value < topValue ? value : "auto";
			}

			if (property === "left") {
				let rightValue = getComputedStyle(element).getPropertyValue("right");
				return value < rightValue ? value : "auto";
			}

			if (property === "right") {
				let leftValue = getComputedStyle(element).getPropertyValue("left");
				return value < leftValue ? value : "auto";
			}
		};

		/**
		 * Save original positions of the iframe
		 * Use case: After maximizing the banner, the widget goes to these positions
		 */
		originalPositions = {
			top: getComputedStyleValue(nobleIframe, "top"),
			left: getComputedStyleValue(nobleIframe, "left"),
			right: getComputedStyleValue(nobleIframe, "right"),
			bottom: getComputedStyleValue(nobleIframe, "bottom"),
		};
	}
});

window.addEventListener("resize", () => iframeResize(false));

window.addEventListener("message", function (event) {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");
	const trustedOrigins = [
		"https://appdev.thatsnoble.com",
		"https://app.thatsnoble.com",
		"http://localhost:5173",
	];
	const allowedNavigationDomains = [
		"https://dimmo.ai",
		"https://webapp-git-noble-integration-lucas-swartsenburgs-projects.vercel.app",
	];

	// Check if the event.origin is in the list of trusted origins
	if (trustedOrigins.includes(event.origin)) {
		// console.log("Message received from a trusted origin:", event.data);

		/**
		 * Message to update iframe Height
		 */
		if (event.data.frameHeight) {
			if (window.innerWidth < 640) nobleIframe.style.height = `100%`;
			else nobleIframe.style.height = event.data.frameHeight + `px`;
		}

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
		if (event.data === "bannerVisible") {
			wasBannerVisibleOnPrevPage = true;
			nobleIframe.style.top = "0px";
			nobleIframe.style.bottom = "auto";
			nobleIframe.style.left = "0px";
			iframeResize(true);

			//Move the body down
			if (window.innerWidth < 640) document.body.style.marginTop = "116px";
			else document.body.style.marginTop = "60px";
		}

		/**
		 * Message to:
		 * - Change the positions of the top fixed/sticky elements back to original
		 * - Change the whole document body position  back to original
		 */
		if (event.data === "bannerMinimized") {
			wasBannerVisibleOnPrevPage = false;
			//Move the body back to 0 and remove the iframe
			document.body.style.marginTop = "0";
			nobleIframe.style.width = "0px";
			nobleIframe.style.height = "0px";
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

			allElements.forEach((element) => {
				// Ignore our iframe
				if (element.id === "nobleIframe") return;

				// Get the computed style of each element
				const computedStyle = getComputedStyle(element);

				// Check if the element is fixed or sticky
				if (
					(computedStyle.position === "fixed" ||
						computedStyle.position === "sticky") &&
					parseInt(computedStyle.top) < parseInt(computedStyle.bottom)
				) {
					// Adjust back the top position
					const currentTop = parseInt(computedStyle.top) || 0;

					if (window.innerWidth < 640)
						element.style.top = currentTop - 116 + "px";
					else element.style.top = currentTop - 60 + "px";
				}
			});
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
		// console.warn("Message received from an untrusted origin:", event.origin);
	}
});
