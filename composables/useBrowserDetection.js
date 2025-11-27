/**
 * Browser Detection Composable
 * Detects the user's browser and returns appropriate browser info
 */
export const useBrowserDetection = () => {
    const getBrowserInfo = () => {
        if (process.server) {
            return {
                name: 'unknown',
                isChrome: false,
                isSafari: false,
                isEdge: false,
                isFirefox: false,
            };
        }

        const userAgent = navigator.userAgent.toLowerCase();
        const vendor = navigator.vendor.toLowerCase();

        // Edge (Chromium-based)
        if (userAgent.includes('edg/')) {
            return {
                name: 'edge',
                isChrome: false,
                isSafari: false,
                isEdge: true,
                isFirefox: false,
            };
        }

        // Chrome
        if (userAgent.includes('chrome') && vendor.includes('google')) {
            return {
                name: 'chrome',
                isChrome: true,
                isSafari: false,
                isEdge: false,
                isFirefox: false,
            };
        }

        // Safari
        if (userAgent.includes('safari') && vendor.includes('apple')) {
            return {
                name: 'safari',
                isChrome: false,
                isSafari: true,
                isEdge: false,
                isFirefox: false,
            };
        }

        // Firefox
        if (userAgent.includes('firefox')) {
            return {
                name: 'firefox',
                isChrome: false,
                isSafari: false,
                isEdge: false,
                isFirefox: true,
            };
        }

        // Default to Chrome-like behavior
        return {
            name: 'unknown',
            isChrome: true,
            isSafari: false,
            isEdge: false,
            isFirefox: false,
        };
    };

    const browserInfo = ref(getBrowserInfo());

    onMounted(() => {
        browserInfo.value = getBrowserInfo();
    });

    return {
        browserInfo: readonly(browserInfo),
        ...browserInfo.value,
    };
};
