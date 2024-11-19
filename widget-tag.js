const currentScriptSrc = document.currentScript.src; // Current script URL
const basePath = currentScriptSrc.substring(0, currentScriptSrc.lastIndexOf('/')); // Extract base path

window.onload = () => {
	// Wait for the iframe to load
	const nobleIframe = document.getElementById("nobleIframe");

	if (!nobleIframe) {
		console.error('[Noble] nobleIframe not found.');
		return; // Exit if the iframe is not found
	}

	const iframeSrc = nobleIframe.src; // Get the iframe's src attribute
	const urlParams = new URLSearchParams(new URL(iframeSrc).search); // Parse query parameters

	// Extract widget-large query parameter
	const widgetLarge = urlParams.get('widget-large');
	let versionNum;

	if (widgetLarge) {
		versionNum = 1
	} else {
		versionNum = 2
	}

	// Redirect based on version num
	const redirectTo = `${basePath}/widget-tag-v${versionNum}.js`;

	// Load the redirected script dynamically
	const script = document.createElement('script');
	script.src = redirectTo;
	script.type = 'text/javascript';

	script.onload = () => {
		console.log(`[Noble] Redirected and loaded major version: ${versionNum}`);
	};

	script.onerror = () => {
		console.error(`[Noble] Failed to load the script at: ${redirectTo}`);
	};

	document.head.appendChild(script); // Inject script
};


