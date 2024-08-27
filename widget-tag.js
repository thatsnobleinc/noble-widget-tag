console.log("[Noble] Noble script loaded 1.0.14");

let originalPositions;



window.addEventListener("load", () => {
	let nobleIframe = document.getElementById("nobleIframe");

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
});

window.addEventListener("message", function (event) {
	let nobleIframe = document.getElementById("nobleIframe");
	const allElements = document.querySelectorAll("*");
	const trustedOrigins = ["https://appdev.thatsnoble.com", "https://app.thatsnoble.com"]
	const allowedNavigationDomains = ["https://dimmo.ai", "https://webapp-git-noble-integration-lucas-swartsenburgs-projects.vercel.app"];

	// Check if the event.origin is in the list of trusted origins
	if (trustedOrigins.includes(event.origin)) {
		// console.log("Message received from a trusted origin:", event.data);

		/**
		 * Message to update iframe Height
		 */
		if (event.data.frameHeight) {
			nobleIframe.style.height = event.data.frameHeight + `px`;
		}

		/**
		 * Message to update iframe Width
		 */
		if (event.data.frameWidth) {
			if (String(event.data.frameWidth).includes("%")) {
				nobleIframe.style.width = event.data.frameWidth;
			} else {
				nobleIframe.style.width = event.data.frameWidth + `px`;
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
		 * Message to:
		 * - Change the positions of the top fixed/sticky elements
		 * - Change the whole document body position
		 */
		if (
			event.data === "bannerVisible" &&
			!window.matchMedia("(max-width: 640px)").matches
		) {
			nobleIframe.style.top = "0px";
			nobleIframe.style.bottom = "auto";
			nobleIframe.style.left = "0px";

			allElements.forEach((element) => {
				// Ignore our iframe
				if (element.id === "nobleIframe") return;

				// Get the computed style of each element
				const computedStyle = getComputedStyle(element);

				// Check if the element is fixed or sticky
				if (
					(computedStyle.position === "fixed" ||
						computedStyle.position === "sticky") &&
					computedStyle.top < computedStyle.bottom
				) {
					// Adjust the top position
					const currentTop = parseInt(computedStyle.top) || 0;
					element.style.top = currentTop + 60 + "px";
				}
			});

			//Move the body down
			document.body.style.marginTop = "60px";
		}

		/**
		 * Message to:
		 * - Change the positions of the top fixed/sticky elements back to original
		 * - Change the whole document body position  back to original
		 */
		if (event.data === "bannerMinimized") {
			//Move the body back to 0 and remove the iframe
			document.body.style.marginTop = "0";
			nobleIframe.style.width = "0px";
			nobleIframe.style.height = "0px";
			nobleIframe.style.top = originalPositions ? originalPositions.top : "80px";
			nobleIframe.style.bottom = originalPositions
				? originalPositions.bottom
				: "auto";
			nobleIframe.style.left = originalPositions ? originalPositions.left : "0px";
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
					computedStyle.top < computedStyle.bottom
				) {
					// Adjust back the top position
					const currentTop = parseInt(computedStyle.top) || 0;
					element.style.top = currentTop - 60 + "px";
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
