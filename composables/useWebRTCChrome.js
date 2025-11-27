/**
 * WebRTC Composable for Chrome
 * Optimized for Chrome browser
 */
export const useWebRTCChrome = ({
    mediaState,
    webrtcState,
    uiState,
    localVideo,
    remoteVideo,
    MEDIA_CONSTRAINTS,
    ICE_SERVERS,
    onPeerSignal,
    onPeerConnect,
    onPeerClose,
    onPeerError
}) => {
    let Peer = null;

    // Dynamically import simple-peer
    const initPeer = async () => {
        if (process.client && !Peer) {
            const module = await import('simple-peer');
            Peer = module.default;
        }
    };

    // Ensure video playback - Chrome optimized
    const ensureVideoPlayback = async (videoRef, stream, { muted = false } = {}) => {
        if (!process.client || !stream) return;

        await nextTick();

        const element = videoRef?.value;
        if (!element) return;

        element.srcObject = stream;
        element.playsInline = true;
        element.muted = muted;
        element.autoplay = true; // Chrome handles autoplay well

        try {
            await element.play();
        } catch (error) {
            console.warn('Chrome: Autoplay prevented:', error);
            // Chrome requires user interaction for unmuted autoplay
            if (!muted) {
                element.muted = true;
                await element.play();
            }
        }

        // Update state
        if (videoRef === localVideo) uiState.videoPaused.local = element.paused;
        if (videoRef === remoteVideo) uiState.videoPaused.remote = element.paused;
    };

    // Start media - Chrome optimized
    const startMedia = async () => {
        if (!process.client || !navigator?.mediaDevices) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
            mediaState.localStream = stream;

            await ensureVideoPlayback(localVideo, stream, { muted: true });

            return stream;
        } catch (error) {
            console.error('Chrome: Media access error:', error);
            throw error;
        }
    };

    // Start screen share - Chrome optimized
    const startScreenShare = async () => {
        if (!webrtcState.peer) return;

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always', // Chrome-specific feature
                    displaySurface: 'monitor'
                }
            });

            mediaState.screenStream = screenStream;
            const screenTrack = screenStream.getVideoTracks()[0];

            const sender = webrtcState.peer._pc.getSenders().find(s => s.track?.kind === 'video');

            if (sender) {
                await sender.replaceTrack(screenTrack);
                await ensureVideoPlayback(localVideo, screenStream, { muted: true });
                mediaState.isScreenSharing = true;

                // Handle screen share end
                screenTrack.onended = () => {
                    stopScreenShare();
                };
            }
        } catch (error) {
            console.error('Chrome: Screen share error:', error);
            throw error;
        }
    };

    // Stop screen share
    const stopScreenShare = async () => {
        const camTrack = mediaState.localStream?.getVideoTracks()[0];

        if (camTrack && webrtcState.peer) {
            const sender = webrtcState.peer._pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                await sender.replaceTrack(camTrack);
            }
        }

        mediaState.screenStream?.getTracks().forEach(t => t.stop());
        await ensureVideoPlayback(localVideo, mediaState.localStream, { muted: true });
        mediaState.isScreenSharing = false;
    };

    // Create peer connection - Chrome optimized
    const createPeer = async (initiator) => {
        await initPeer();

        if (!Peer || !mediaState.localStream || webrtcState.peer) return;

        webrtcState.peer = new Peer({
            initiator,
            trickle: false,
            stream: mediaState.localStream,
            config: {
                iceServers: ICE_SERVERS,
                // Chrome-specific optimizations
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require',
                iceTransportPolicy: 'all'
            },
            reconnectTimer: 3000,
            offerOptions: {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            }
        });

        setupPeerListeners();
    };

    // Setup peer listeners
    const setupPeerListeners = () => {
        const peer = webrtcState.peer;
        if (!peer) return;

        peer.on('signal', onPeerSignal);
        peer.on('connect', onPeerConnect);
        peer.on('stream', async (remote) => {
            console.log('Chrome: Remote stream received');
            await nextTick();

            if (!remoteVideo.value) {
                setTimeout(() => {
                    if (remoteVideo.value && remote) {
                        ensureVideoPlayback(remoteVideo, remote);
                        webrtcState.remoteStreamPresent = true;
                    }
                }, 100);
                return;
            }

            webrtcState.remoteStreamPresent = true;
            await ensureVideoPlayback(remoteVideo, remote);
        });
        peer.on('close', onPeerClose);
        peer.on('error', onPeerError);
    };

    // Handle video pause
    const handleVideoPause = (event, target) => {
        uiState.videoPaused[target] = true;

        const video = event.target;
        if (video && !video.ended && video.paused) {
            video.play().catch(() => {
                // Autoplay failed
            });
        }
    };

    // Handle video play
    const handleVideoPlay = (event, target) => {
        uiState.videoPaused[target] = false;
    };

    // Retry play
    const retryPlay = (target) => {
        const video = target === 'local' ? localVideo.value : remoteVideo.value;
        if (video) {
            video.play().catch(e => console.error('Chrome: Retry play failed:', e));
        }
    };

    // Toggle mic
    const toggleMic = () => {
        mediaState.micEnabled = !mediaState.micEnabled;
        mediaState.localStream?.getAudioTracks().forEach(t => {
            t.enabled = mediaState.micEnabled;
        });
    };

    // Toggle camera
    const toggleCamera = () => {
        mediaState.camEnabled = !mediaState.camEnabled;
        mediaState.localStream?.getVideoTracks().forEach(t => {
            t.enabled = mediaState.camEnabled;
        });
    };

    // Destroy peer
    const destroyPeer = () => {
        if (webrtcState.peer) {
            try {
                webrtcState.peer.destroy();
            } catch {}
            webrtcState.peer = null;
        }
    };

    return {
        ensureVideoPlayback,
        startMedia,
        startScreenShare,
        stopScreenShare,
        createPeer,
        handleVideoPause,
        handleVideoPlay,
        retryPlay,
        toggleMic,
        toggleCamera,
        destroyPeer
    };
};
