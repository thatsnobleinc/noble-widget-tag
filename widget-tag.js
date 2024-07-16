console.log("[Noble] Noble script loaded 1.0.8");
const nobleIframe = document.getElementById("nobleIframe");

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
const originalPositions = {
	top: getComputedStyleValue(nobleIframe, "top"),
	left: getComputedStyleValue(nobleIframe, "left"),
	right: getComputedStyleValue(nobleIframe, "right"),
	bottom: getComputedStyleValue(nobleIframe, "bottom"),
};

window.addEventListener("message", function (event) {
	const allElements = document.querySelectorAll("*");

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
				computedStyle.position === "fixed" ||
				computedStyle.position === "sticky"
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
		nobleIframe.style.top = originalPositions.top;
		nobleIframe.style.bottom = originalPositions.bottom;
		nobleIframe.style.left = originalPositions.left;
		nobleIframe.style.right = originalPositions.right;

		allElements.forEach((element) => {
			// Ignore our iframe
			if (element.id === "nobleIframe") return;

			// Get the computed style of each element
			const computedStyle = getComputedStyle(element);

			// Check if the element is fixed or sticky
			if (
				computedStyle.position === "fixed" ||
				computedStyle.position === "sticky"
			) {
				// Adjust back the top position
				const currentTop = parseInt(computedStyle.top) || 0;
				element.style.top = currentTop - 60 + "px";
			}
		});
	}
});
