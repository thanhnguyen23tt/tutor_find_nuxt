/**
 * WebRTC Adapter Composable
 * Automatically selects the appropriate WebRTC implementation based on browser
 */
export const useWebRTCAdapter = (config) => {
    const { browserInfo } = useBrowserDetection();

    const getWebRTCImplementation = () => {
        if (browserInfo.value.isSafari) {
            console.log('Using Safari-optimized WebRTC');
            return useWebRTCSafari(config);
        }

        if (browserInfo.value.isEdge) {
            console.log('Using Edge-optimized WebRTC');
            return useWebRTCEdge(config);
        }

        // Default to Chrome (works for Chrome, Firefox, and unknown browsers)
        console.log('Using Chrome-optimized WebRTC');
        return useWebRTCChrome(config);
    };

    return getWebRTCImplementation();
};
