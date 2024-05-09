window.addEventListener("message", function (event) {
	let nobleIframe = document.getElementById("nobleIframe");
	console.log("[Noble] Noble script loaded 1.0.0");

	if (event.data.frameHeight) {
		nobleIframe.style.height = event.data.frameHeight + `px`;
	}

	if (event.data.frameWidth) {
		if (String(event.data.frameWidth).includes("%")) {
			nobleIframe.style.width = event.data.frameWidth;
		} else {
			nobleIframe.style.width = event.data.frameWidth + `px`;
		}
	}

	if (event.data === "bannerVisible") {
		nobleIframe.style.bottom = "0px";
		nobleIframe.style.top = "auto";
		nobleIframe.style.left = "0px";
	}

	if (event.data === "getURL") {
		const iframeURL = window.location.href;
		event.source.postMessage({ iframeURL: iframeURL }, event.origin);
	}
});
