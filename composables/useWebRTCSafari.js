/**
 * WebRTC Composable for Safari
 * Optimized for Safari browser with specific workarounds
 */
export const useWebRTCSafari = ({
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

    // Ensure video playback - Safari optimized
    const ensureVideoPlayback = async (videoRef, stream, { muted = false } = {}) => {
        if (!process.client || !stream) return;

        await nextTick();

        const element = videoRef?.value;
        if (!element) return;

        // Safari requires these to be set before srcObject
        element.playsInline = true;
        element.muted = muted;
        element.autoplay = true;
        
        // Safari-specific: Set webkit-playsinline
        element.setAttribute('webkit-playsinline', 'true');
        element.setAttribute('playsinline', 'true');

        element.srcObject = stream;

        // Safari often requires a delay before play
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            // Safari requires promise-based play
            const playPromise = element.play();
            if (playPromise !== undefined) {
                await playPromise;
            }
        } catch (error) {
            console.warn('Safari: Autoplay prevented:', error);
            
            // Safari fallback: try with muted
            if (!muted) {
                element.muted = true;
                try {
                    await element.play();
                } catch (retryError) {
                    console.error('Safari: Play retry failed:', retryError);
                }
            }
        }

        // Update state
        if (videoRef === localVideo) uiState.videoPaused.local = element.paused;
        if (videoRef === remoteVideo) uiState.videoPaused.remote = element.paused;
    };

    // Start media - Safari optimized
    const startMedia = async () => {
        if (!process.client || !navigator?.mediaDevices) return;

        try {
            // Safari-specific constraints
            const safariConstraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 360 },
                    frameRate: { ideal: 24, max: 30 }, // Safari prefers lower framerates
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(safariConstraints);
            mediaState.localStream = stream;

            // Safari needs extra time to initialize
            await new Promise(resolve => setTimeout(resolve, 200));
            await ensureVideoPlayback(localVideo, stream, { muted: true });

            return stream;
        } catch (error) {
            console.error('Safari: Media access error:', error);
            throw error;
        }
    };

    // Start screen share - Safari optimized
    const startScreenShare = async () => {
        if (!webrtcState.peer) return;

        try {
            // Safari has limited screen share support
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    frameRate: { ideal: 15, max: 24 } // Lower framerate for Safari
                }
            });

            mediaState.screenStream = screenStream;
            const screenTrack = screenStream.getVideoTracks()[0];

            const sender = webrtcState.peer._pc.getSenders().find(s => s.track?.kind === 'video');

            if (sender) {
                await sender.replaceTrack(screenTrack);
                
                // Safari needs delay before playback
                await new Promise(resolve => setTimeout(resolve, 150));
                await ensureVideoPlayback(localVideo, screenStream, { muted: true });
                mediaState.isScreenSharing = true;

                // Handle screen share end
                screenTrack.onended = () => {
                    stopScreenShare();
                };
            }
        } catch (error) {
            console.error('Safari: Screen share error:', error);
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
        
        // Safari needs delay
        await new Promise(resolve => setTimeout(resolve, 100));
        await ensureVideoPlayback(localVideo, mediaState.localStream, { muted: true });
        mediaState.isScreenSharing = false;
    };

    // Create peer connection - Safari optimized
    const createPeer = async (initiator) => {
        await initPeer();

        if (!Peer || !mediaState.localStream || webrtcState.peer) return;

        // Safari-specific peer configuration
        webrtcState.peer = new Peer({
            initiator,
            trickle: false, // Safari works better with trickle: false
            stream: mediaState.localStream,
            config: {
                iceServers: ICE_SERVERS,
                // Safari-specific optimizations
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require',
                iceTransportPolicy: 'all',
                // Add TURN server for Safari reliability
                iceCandidatePoolSize: 10
            },
            reconnectTimer: 5000, // Longer reconnect timer for Safari
            offerOptions: {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
                voiceActivityDetection: false // Safari performs better without VAD
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
            console.log('Safari: Remote stream received');
            
            // Safari needs more time to prepare video element
            await nextTick();
            await new Promise(resolve => setTimeout(resolve, 200));

            if (!remoteVideo.value) {
                setTimeout(async () => {
                    if (remoteVideo.value && remote) {
                        await ensureVideoPlayback(remoteVideo, remote);
                        webrtcState.remoteStreamPresent = true;
                    }
                }, 300);
                return;
            }

            webrtcState.remoteStreamPresent = true;
            await ensureVideoPlayback(remoteVideo, remote);
        });
        peer.on('close', onPeerClose);
        peer.on('error', onPeerError);
    };

    // Handle video pause - Safari specific
    const handleVideoPause = (event, target) => {
        uiState.videoPaused[target] = true;

        const video = event.target;
        if (video && !video.ended && video.paused) {
            // Safari may pause videos unexpectedly, retry with delay
            setTimeout(() => {
                video.play().catch(() => {
                    console.warn('Safari: Auto-resume failed');
                });
            }, 100);
        }
    };

    // Handle video play
    const handleVideoPlay = (event, target) => {
        uiState.videoPaused[target] = false;
    };

    // Retry play - Safari specific
    const retryPlay = (target) => {
        const video = target === 'local' ? localVideo.value : remoteVideo.value;
        if (video) {
            // Safari may need user interaction
            video.muted = true;
            video.play()
                .then(() => {
                    console.log('Safari: Play succeeded after retry');
                })
                .catch(e => console.error('Safari: Retry play failed:', e));
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
                // Safari sometimes throws errors on destroy
                webrtcState.peer.destroy();
            } catch (error) {
                console.warn('Safari: Peer destroy error (ignored):', error);
            }
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
