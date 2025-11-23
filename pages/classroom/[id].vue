<script setup>
definePageMeta({
	name: 'classroom',
  	middleware: 'auth',
	layout: false
});

import {
    ref,
    computed,
    reactive,
    onMounted,
    onBeforeUnmount,
    nextTick
} from 'vue'

let Peer
if (process.client) {
    const module = await import('simple-peer')
    Peer = module.default
}

// ===== Composables & Instances =====
const route = useRoute()
const {
    api
} = useApi()
const {
    error: notifyError
} = useNotification()
const {
    status_classroom: statusClassroom
} = useConfig()
const userStore = useUserStore()

// ===== Media State (Gộp các biến liên quan đến media) =====
const mediaState = reactive({
    localStream: null,
    screenStream: null,
    micEnabled: true,
    camEnabled: true,
    isScreenSharing: false,
})

// ===== Video Elements =====
const localVideo = ref(null)
const remoteVideo = ref(null)
const localVideoContainer = ref(null)
const remoteVideoContainer = ref(null)
const videoSectionRef = ref(null)

// ===== WebRTC State (Gộp các biến liên quan đến peer) =====
const webrtcState = reactive({
    peer: null,
    channel: null,
    targetUid: '',
    peerName: '',
    lastSentSdp: '',
    hasStarted: false,
    remoteStreamPresent: false,
})

// ===== Classroom State (Gộp các biến liên quan đến classroom) =====
const classroomState = reactive({
    data: null,
    isLoading: false,
    canAccess: true,
    participantsCount: 1,
})

// ===== UI State (Gộp các biến liên quan đến UI) =====
const uiState = reactive({
    layoutMode: 'split',
    pinnedTarget: 'local',
    isMobile: false,
    joinSoundEnabled: true,
    isFullscreen: false,
    areControlsVisible: true,
    minimized: {
        local: false,
        remote: false
    },
    videoPaused: {
        local: true,
        remote: true
    },
    controlsVisible: false
})

// ===== Audio Context =====
const audioContext = ref(null)

// ===== Constants =====
const MEDIA_CONSTRAINTS = {
    video: {
        width: {
            ideal: 640
        },
        height: {
            ideal: 360
        },
        frameRate: {
            ideal: 24
        }
    },
    audio: true
}

const ICE_SERVERS = [{
    urls: 'stun:stun.l.google.com:19302'
}]

const MOBILE_BREAKPOINT = 1024

// ===== Computed =====
const userData = computed(() => userStore.getUserData)
const userDataUid = computed(() => userData.value?.uid)

const labels = computed(() => ({
    self: 'Bạn',
    peer: webrtcState.peerName || 'Chờ...'
}))

const isLocalVideoOn = computed(() => {
    const track = mediaState.localStream?.getVideoTracks?.()?. [0]
    return !!(track?.enabled)
})

const checkStatusClassroom = computed(() => {
    if (!classroomState.data) return 'Lớp học chưa đến giờ bắt đầu.'

    const {
        status
    } = classroomState.data

    if (status === statusClassroom.ended) return 'Lớp học đã kết thúc.'
    if (status !== statusClassroom.started) {
        return 'Lớp học chưa bắt đầu. Vui lòng chờ gia sư bắt đầu lớp học.'
    }

    return 'Lớp học chưa đến giờ bắt đầu.'
})

// ===== Classroom Methods =====
async function loadClassroom() {
    classroomState.isLoading = true

    try {
        const id = route.params.id
        const res = await api.apiGet(`classrooms/${id}`)

        if (!res?.success) {
            classroomState.data = {
                id
            }
            return false
        }

        classroomState.data = res.data

        // Validate classroom access
        const validationResult = validateClassroomAccess(res)
        if (!validationResult.canAccess) {
            notifyError(validationResult.message)
            redirectCantAccessClassroom()
            return false
        }

        return true
    } catch (error) {
        classroomState.data = {
            id: route.params.id
        }
        notifyError('Không thể tải thông tin lớp học')
        redirectCantAccessClassroom()
        return false
    } finally {
        classroomState.isLoading = false
    }
}

function validateClassroomAccess(response) {
    const {
        data
    } = response

    if (data.status === statusClassroom.ended) {
        return {
            canAccess: false,
            message: 'Lớp học đã kết thúc.'
        }
    }

    if (data.status !== statusClassroom.started) {
        return {
            canAccess: false,
            message: 'Lớp học chưa bắt đầu. Vui lòng chờ gia sư bắt đầu lớp học.'
        }
    }

    if (response.time_info?.can_start === false) {
        return {
            canAccess: false,
            message: response.time_info.time_status_text
        }
    }

    return {
        canAccess: true
    }
}

function redirectCantAccessClassroom() {
    classroomState.canAccess = false
}

// ===== Echo & WebRTC Methods =====
async function initEcho() {
    if (!process.client || !window?.Echo) return

    webrtcState.channel = window.Echo.join(`classroom.${classroomState.data.id}`)
        .here(handleUsersPresent)
        .joining(handleUserJoining)
        .leaving(handleUserLeaving)

    window.Echo.private(`private-webrtc.${userDataUid.value}`)
        .listen('.webrtc.signal', handleSignal)
}

function handleUsersPresent(users) {
    classroomState.participantsCount = users.length

    const other = users.find(u => u.id !== userDataUid.value)
    if (other) {
        updatePeerInfo(other)
    }

    if (users.length >= 2) createPeer(true)
}

function handleUserJoining(user) {
    classroomState.participantsCount += 1

    if (user.id !== userDataUid.value) {
        updatePeerInfo(user)
    }

    playJoinSound()
}

function handleUserLeaving() {
    classroomState.participantsCount = Math.max(0, classroomState.participantsCount - 1)
    webrtcState.remoteStreamPresent = false
}

function updatePeerInfo(user) {
    webrtcState.targetUid = user.id
    webrtcState.peerName = user.name || ''
}

function handleSignal(e) {
    if (e.from === userDataUid.value) return

    if (!webrtcState.peer || webrtcState.peer.destroyed) {
        createPeer(false)
    }

    if (webrtcState.peer && !webrtcState.peer.destroyed) {
        webrtcState.peer.signal(e.signal)
    }
}

function playJoinSound() {
    if (!process.client || !uiState.joinSoundEnabled) return

    try {
        if (!audioContext.value) {
            audioContext.value = new(window.AudioContext || window.webkitAudioContext)()
        }

        const ctx = audioContext.value
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        // Configure sound
        oscillator.frequency.setValueAtTime(800, ctx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)

        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
    } catch (error) {
        console.log('Could not play join sound:', error)
    }
}

// ===== Media Methods =====
async function ensureVideoPlayback(videoRef, stream, {
    muted = false
} = {}) {
    if (!process.client || !stream) return

    await nextTick()

    const element = videoRef?.value
    if (!element) return

    element.srcObject = stream
    element.playsInline = true
    element.muted = muted

    try {
        await element.play()
    } catch (error) {
        console.warn('Autoplay prevented:', error)
    }

    // Update state
    if (videoRef === localVideo) uiState.videoPaused.local = element.paused
    if (videoRef === remoteVideo) uiState.videoPaused.remote = element.paused
}

function handleVideoPause(event, target) {
    uiState.videoPaused[target] = true
    
    const video = event.target
    if (video && !video.ended && video.paused) {
        video.play().catch(() => {
            // Autoplay failed, state remains paused, overlay will show
        })
    }
}

function handleVideoPlay(event, target) {
    uiState.videoPaused[target] = false
}

function retryPlay(target) {
    const video = target === 'local' ? localVideo.value : remoteVideo.value
    if (video) {
        video.play().catch(e => console.error('Retry play failed:', e))
    }
}

async function startMedia() {
    if (!process.client || !navigator?.mediaDevices) return

    try {
        const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
        mediaState.localStream = stream

        await ensureVideoPlayback(localVideo, stream, {
            muted: true
        })

        if (classroomState.participantsCount >= 2) {
            createPeer(true)
        }
    } catch (error) {
        console.error('Media access error:', error)
    }
}

async function toggleScreenShare() {
    if (!process.client || !webrtcState.peer) return

    if (!mediaState.isScreenSharing) {
        await startScreenShare()
    } else {
        await stopScreenShare()
    }
}

async function startScreenShare() {
    try {
        mediaState.screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        })
        const screenTrack = mediaState.screenStream.getVideoTracks()[0]

        const sender = webrtcState.peer._pc.getSenders().find(s => s.track?.kind === 'video')

        if (sender) {
            await sender.replaceTrack(screenTrack)
            await ensureVideoPlayback(localVideo, mediaState.screenStream, {
                muted: true
            })
            mediaState.isScreenSharing = true
            screenTrack.onended = () => toggleScreenShare()
        }
    } catch (error) {
        console.error('Screen share error:', error)
    }
}

async function stopScreenShare() {
    const camTrack = mediaState.localStream?.getVideoTracks()[0]

    if (camTrack) {
        const sender = webrtcState.peer._pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
            await sender.replaceTrack(camTrack)
        }
    }

    mediaState.screenStream?.getTracks().forEach(t => t.stop())

    await ensureVideoPlayback(localVideo, mediaState.localStream, {
        muted: true
    })

    mediaState.isScreenSharing = false
}

function toggleMic() {
    mediaState.micEnabled = !mediaState.micEnabled
    mediaState.localStream?.getAudioTracks().forEach(t => {
        t.enabled = mediaState.micEnabled
    })
}

function toggleCamera() {
    mediaState.camEnabled = !mediaState.camEnabled
    mediaState.localStream?.getVideoTracks().forEach(t => {
        t.enabled = mediaState.camEnabled
    })
}

// ===== Peer Methods =====
function createPeer(initiator) {
    if (!Peer || !mediaState.localStream || webrtcState.peer) return

    webrtcState.peer = new Peer({
        initiator,
        trickle: false,
        stream: mediaState.localStream,
        config: {
            iceServers: ICE_SERVERS
        },
        reconnectTimer: 3000
    })

    // Setup peer event listeners
    setupPeerListeners()
}

function setupPeerListeners() {
    const peer = webrtcState.peer

    peer.on('signal', handlePeerSignal)
    peer.on('connect', handlePeerConnect)
    peer.on('stream', handlePeerStream)
    peer.on('close', handlePeerClose)
    peer.on('error', handlePeerError)
}

async function handlePeerSignal(data) {
    try {
        // Prevent duplicate SDP sending
        if (data?.sdp && webrtcState.lastSentSdp === data.sdp) return

        if (data?.sdp) {
            webrtcState.lastSentSdp = data.sdp
        }

        await api.apiPost('webrtc/signal', {
            classroom_id: classroomState.data.id,
            from: userDataUid.value,
            to: webrtcState.targetUid || '*',
            signal: data
        })
    } catch (error) {
        console.error('Signal send error:', error)
    }
}

function handlePeerConnect() {
    if (!webrtcState.hasStarted) {
        webrtcState.hasStarted = true
    }
}

async function handlePeerStream(remote) {
    console.log('Remote stream received:', remote)
    
    // Wait for next tick to ensure video element is mounted
    await nextTick()
    
    if (!remoteVideo.value) {
        console.error('Remote video element not ready')
        // Retry after a short delay
        setTimeout(() => {
            if (remoteVideo.value && remote) {
                ensureVideoPlayback(remoteVideo, remote)
                webrtcState.remoteStreamPresent = true
            }
        }, 100)
        return
    }
    
    webrtcState.remoteStreamPresent = true
    await ensureVideoPlayback(remoteVideo, remote)
}

function handlePeerClose() {
    console.log('Peer connection closed')
    webrtcState.remoteStreamPresent = false
    destroyPeer()
}

function handlePeerError(error) {
    console.error('Peer error:', error)
    webrtcState.remoteStreamPresent = false
    destroyPeer()
}

function destroyPeer() {
    if (webrtcState.peer) {
        try {
            webrtcState.peer.destroy()
        } catch {}
        webrtcState.peer = null
    }
}

// ===== Layout Methods =====
function setLayout(mode) {
    if (!['split', 'pinned'].includes(mode)) return

    // Mobile không cho phép split mode
    if (uiState.isMobile && mode === 'split') return

    uiState.layoutMode = mode
}

function pinLocal() {
    uiState.layoutMode = 'pinned'
    uiState.pinnedTarget = 'local'
}

function pinRemote() {
    uiState.layoutMode = 'pinned'
    uiState.pinnedTarget = 'remote'
}

function updateMobileStatus() {
    if (typeof window !== 'undefined') {
        uiState.isMobile = window.innerWidth < MOBILE_BREAKPOINT
    }
}

function checkAndAdjustLayoutForMobile() {
    updateMobileStatus()

    if (uiState.isMobile && uiState.layoutMode === 'split') {
        uiState.layoutMode = 'pinned'
        uiState.pinnedTarget = 'local'
    }
}

// ===== Fullscreen Methods =====
async function toggleFullscreen() {
    if (!process.client) return

    const elem = videoSectionRef.value
    if (!elem) return

    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        if (elem.requestFullscreen) {
            await elem.requestFullscreen()
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            await elem.webkitRequestFullscreen()
        } else if (elem.msRequestFullscreen) { /* IE11 */
            await elem.msRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            await document.exitFullscreen()
        } else if (document.webkitExitFullscreen) { /* Safari */
            await document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) { /* IE11 */
            await document.msExitFullscreen()
        }
    }
}

function onFullscreenChange() {
    uiState.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)

    // Force play videos when exiting fullscreen to prevent pausing
    if (!uiState.isFullscreen) {
        if (localVideo.value && localVideo.value.paused && !localVideo.value.ended) {
            localVideo.value.play().catch(() => {})
        }
        if (remoteVideo.value && remoteVideo.value.paused && !remoteVideo.value.ended) {
            remoteVideo.value.play().catch(() => {})
        }
    }
}

async function toggleElementFullscreen(element) {
    if (!process.client || !element) return

    // On mobile, we might want to fullscreen the video element itself if the container doesn't work well
    // But usually container is better for custom controls.
    // Let's try to support standard APIs more robustly.

    const isFullscreen = document.fullscreenElement === element || 
    document.webkitFullscreenElement === element || 
    document.mozFullScreenElement === element || 
    document.msFullscreenElement === element

    try {
        if (isFullscreen) {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen()
            }
        } else {
            // Mobile Safari often requires the video element itself to be fullscreened for native player
            // But here we have custom controls, so we want the container.
            // If requestFullscreen fails on container in iOS, it might be because it only supports it on <video>.
            // However, modern iOS Safari supports API on elements.
            
            if (element.requestFullscreen) {
                await element.requestFullscreen()
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen()
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen()
            } else if (element.querySelector('video') && uiState.isMobile) {
                 // Fallback for some mobile browsers: fullscreen the video tag directly if container fails
                 // Note: This might lose custom controls overlay.
                 const videoTag = element.querySelector('video')
                 if (videoTag.webkitEnterFullscreen) {
                     videoTag.webkitEnterFullscreen()
                 }
            }
        }
    } catch (err) {
        console.error('Fullscreen error:', err)
    }
}

function toggleMinimize(target) {
    if (uiState.minimized[target] !== undefined) {
        uiState.minimized[target] = !uiState.minimized[target]
    }
}

// ===== Session Methods =====
async function onLeaveClassroom() {
    if (process.client) {
        window.close()
    }
}

// ===== Cleanup =====
function cleanup() {
    // Stop all media tracks
    mediaState.localStream?.getTracks().forEach(t => t.stop())
    mediaState.screenStream?.getTracks().forEach(t => t.stop())

    // Destroy peer connection
    destroyPeer()

    // Leave Echo channel
    if (webrtcState.channel) {
        webrtcState.channel.leave()
    }

    // Close audio context
    if (audioContext.value) {
        audioContext.value.close()
    }
}

// ===== Lifecycle =====
onMounted(async () => {
    updateMobileStatus()

    const canAccess = await loadClassroom()

    if (canAccess) {
        await startMedia()
        await initEcho()
    }

    checkAndAdjustLayoutForMobile()

    if (process.client) {
        window.addEventListener('resize', checkAndAdjustLayoutForMobile)
        document.addEventListener('fullscreenchange', onFullscreenChange)
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        window.removeEventListener('resize', checkAndAdjustLayoutForMobile)
        document.removeEventListener('fullscreenchange', onFullscreenChange)
    }

    cleanup()
})

// Auto-hide controls timer
let controlsTimer = null

function showControls() {
    uiState.controlsVisible = true
    
    // Clear existing timer
    if (controlsTimer) clearTimeout(controlsTimer)
    
    // Auto-hide after 3 seconds of no interaction
    controlsTimer = setTimeout(() => {
        uiState.controlsVisible = false
    }, 3000)
}

function hideControls() {
    if (controlsTimer) clearTimeout(controlsTimer)
    uiState.controlsVisible = false
}

// ===== Export for template usage =====
defineExpose({
    // State
    mediaState,
    webrtcState,
    classroomState,
    uiState,

    // Computed
    labels,
    isLocalVideoOn,
    checkStatusClassroom,

    // Methods
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    setLayout,
    pinLocal,
    pinRemote,
    onLeaveClassroom,
    toggleFullscreen,
    toggleElementFullscreen,
})
</script>

<template>
    <base-loading v-if="classroomState.isLoading" />

    <div class="classroom-container" v-if="!classroomState.isLoading">
        <!-- Access denied message -->
        <div v-if="!classroomState.canAccess" class="access-denied">
            <div class="access-denied-content">
                <div class="access-denied-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-max-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m4.9 4.9 14.2 14.2"></path>
                    </svg>
                </div>
                <h2 class="access-denied-title">Không thể truy cập lớp học</h2>
                <p class="access-denied-message">{{ checkStatusClassroom }}</p>
                <p class="access-denied-subtitle">Bạn sẽ được chuyển về trang quản lý lớp học trong giây lát...</p>
                <NuxtLink to="/classroom-manager" class="access-denied-btn">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9,22 9,12 15,12 15,22"></polyline>
                    </svg>
                    Quay lại trang quản lý
                </NuxtLink>
            </div>
        </div>

        <!-- Main classroom interface -->
        <div v-else class="classroom-main">
            <!-- Header Section -->
            <div class="classroom-header">
                <div class="header-left">
                    <div class="classroom-info" v-if="classroomState.data">
                        <h3 class="classroom-title">{{ classroomState.data.topic || 'Lớp học trực tuyến' }}</h3>
                        <p class="classroom-subtitle">Mã booking: {{ classroomState.data.booking?.request_code }}</p>
                    </div>
                </div>

                <div class="header-right">
                    <div class="participants-info fancy-chip">
                        <svg class="participants-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span class="count">{{ classroomState.participantsCount }}</span>
                        <span class="label">người tham gia</span>
                    </div>

                    <div class="header-actions">
                        <button class="settings-btn" title="Cài đặt">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Video Section -->
            <div class="video-section" ref="videoSectionRef" :class="{ 'is-fullscreen': uiState.isFullscreen }">
                <div class="video-grid" :class="`layout-${uiState.layoutMode}`">
                    <!-- Local Video -->
                    <div class="video-container local-video" ref="localVideoContainer" :class="{ 
                        'is-primary': uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'local', 
                        'is-secondary': uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'remote',
                        'is-minimized': uiState.minimized.local && uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'remote'
                    }">
                        <div class="video-wrapper">
                            <video ref="localVideo" autoplay playsinline webkit-playsinline muted class="video-element" @pause="e => handleVideoPause(e, 'local')" @play="e => handleVideoPlay(e, 'local')" oncontextmenu="return false;"></video>
                            <div v-if="uiState.videoPaused.local" class="play-overlay" @click.stop="retryPlay('local')">
                                <svg class="icon-xl" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                            <div v-if="!isLocalVideoOn" class="video-overlay">
                                <div class="overlay-content">
                                    <svg class="overlay-icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                                        <rect x="2" y="6" width="14" height="12" rx="2" />
                                    </svg>
                                    <p class="overlay-text">Camera đã tắt</p>
                                </div>
                            </div>

                            <!-- Layout Controls -->
                            <div class="layout-controls">
                                <button 
                                    class="layout-btn" 
                                    :class="{ active: uiState.layoutMode === 'split' }" 
                                    @click="setLayout('split')" 
                                    title="Chế độ 50/50"
                                    v-if="!uiState.isMobile"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="5" width="8" height="14" rx="2"></rect>
                                        <rect x="13" y="5" width="8" height="14" rx="2"></rect>
                                    </svg>
                                    <span>50/50</span>
                                </button>
                                <button 
                                    class="layout-btn" 
                                    :class="{ active: uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'local' }" 
                                    @click="pinLocal" 
                                    title="Ghim màn hình của tôi"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="4" width="20" height="14" rx="2"></rect>
                                        <rect x="14" y="12" width="8" height="6" rx="2"></rect>
                                    </svg>
                                    <span>Ghim</span>
                                </button>
                                <button 
                                    class="layout-btn" 
                                    @click="toggleMinimize('local')" 
                                    :title="uiState.minimized.local ? 'Mở rộng' : 'Thu nhỏ'"
                                    v-if="uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'remote'"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <template v-if="uiState.minimized.local">
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <polyline points="9 21 3 21 3 15"></polyline>
                                            <line x1="21" y1="3" x2="14" y2="10"></line>
                                            <line x1="3" y1="21" x2="10" y2="14"></line>
                                        </template>
                                        <template v-else>
                                            <polyline points="4 14 10 14 10 20"></polyline>
                                            <polyline points="20 10 14 10 14 4"></polyline>
                                            <line x1="14" y1="10" x2="21" y2="3"></line>
                                            <line x1="3" y1="21" x2="10" y2="14"></line>
                                        </template>
                                    </svg>
                                </button>
                                <button 
                                    class="layout-btn" 
                                    @click="toggleElementFullscreen(localVideoContainer)" 
                                    title="Toàn màn hình"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                                        <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                                        <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                                        <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                                    </svg>
                                </button>
                            </div>

                            <!-- Video Controls Overlay -->
                            <div class="video-controls">
                                <div class="video-badges">
                                    <div v-if="!mediaState.micEnabled" class="badge mute-badge" title="Mic tắt">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="2" x2="22" y1="2" y2="22"></line>
                                            <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path>
                                            <path d="M5 10v2a7 7 0 0 0 12 5"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div class="video-label">
                                    <span class="label-text">{{ labels.self }}</span>
                                    <div class="label-indicator local"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Remote Video -->
                    <div class="video-container remote-video" ref="remoteVideoContainer" :class="{ 
                        'is-primary': uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'remote', 
                        'is-secondary': uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'local',
                        'is-minimized': uiState.minimized.remote && uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'local'
                    }">
                        <div class="video-wrapper">
                            <video ref="remoteVideo" autoplay playsinline webkit-playsinline class="video-element" @pause="e => handleVideoPause(e, 'remote')" @play="e => handleVideoPlay(e, 'remote')" oncontextmenu="return false;"></video>
                            <div v-if="uiState.videoPaused.remote && webrtcState.remoteStreamPresent" class="play-overlay" @click.stop="retryPlay('remote')">
                                <svg class="icon-xl" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                            <div v-if="!webrtcState.remoteStreamPresent" class="video-overlay">
                                <div class="overlay-content">
                                    <svg class="overlay-icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                                        <rect x="2" y="6" width="14" height="12" rx="2" />
                                    </svg>
                                    <p class="overlay-text" v-if="!webrtcState.hasStarted">Chờ kết nối...</p>
                                    <p class="overlay-text" v-else>Đang chờ video...</p>
                                </div>
                            </div>

                            <!-- Layout Controls for remote -->
                            <div class="layout-controls">
                                <button 
                                    class="layout-btn" 
                                    :class="{ active: uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'remote' }" 
                                    @click="pinRemote" 
                                    title="Ghim màn hình đối phương"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="4" width="20" height="14" rx="2"></rect>
                                        <rect x="14" y="12" width="8" height="6" rx="2"></rect>
                                    </svg>
                                    <span>Ghim</span>
                                </button>
                                <button 
                                    class="layout-btn" 
                                    @click="toggleMinimize('remote')" 
                                    :title="uiState.minimized.remote ? 'Mở rộng' : 'Thu nhỏ'"
                                    v-if="uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'local'"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <template v-if="uiState.minimized.remote">
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <polyline points="9 21 3 21 3 15"></polyline>
                                            <line x1="21" y1="3" x2="14" y2="10"></line>
                                            <line x1="3" y1="21" x2="10" y2="14"></line>
                                        </template>
                                        <template v-else>
                                            <polyline points="4 14 10 14 10 20"></polyline>
                                            <polyline points="20 10 14 10 14 4"></polyline>
                                            <line x1="14" y1="10" x2="21" y2="3"></line>
                                            <line x1="3" y1="21" x2="10" y2="14"></line>
                                        </template>
                                    </svg>
                                </button>
                                <button 
                                    class="layout-btn" 
                                    @click="toggleElementFullscreen(remoteVideoContainer)" 
                                    title="Toàn màn hình"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                                        <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                                        <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                                        <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                                    </svg>
                                </button>
                            </div>

                            <!-- Video Controls Overlay -->
                            <div class="video-controls">
                                <div class="video-badges"></div>
                                <div class="video-label">
                                    <span class="label-text">{{ labels.peer }}</span>
                                    <div class="label-indicator remote"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Floating control bar -->
                <div class="floating-controls" @mouseenter="showControls" @mousemove="showControls" @mouseleave="hideControls" @touchstart="showControls">
                    <Transition name="slide-up">
                        <div class="floating-controls-wrapper" v-if="uiState.controlsVisible">
                            <!-- Camera -->
                            <button
                                class="control-btn"
                                :class="{ active: mediaState.camEnabled }"
                                @click="toggleCamera"
                                :title="mediaState.camEnabled ? 'Tắt camera' : 'Bật camera'"
                            >
                                <svg
                                    class="icon-md"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <template v-if="mediaState.camEnabled">
                                        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                                        <rect x="2" y="6" width="14" height="12" rx="2"></rect>
                                    </template>
                                    <template v-else>
                                        <path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"></path>
                                        <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"></path>
                                        <path d="m2 2 20 20"></path>
                                    </template>
                                </svg>
                            </button>

                            <!-- Microphone -->
                            <button
                                class="control-btn"
                                :class="{ active: mediaState.micEnabled }"
                                @click="toggleMic"
                                :title="mediaState.micEnabled ? 'Tắt mic' : 'Bật mic'"
                            >
                                <svg
                                    class="icon-md"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <template v-if="mediaState.micEnabled">
                                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                        <line x1="12" x2="12" y1="19" y2="22" />
                                    </template>
                                    <template v-else>
                                        <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                                        <path d="M5 10v2a7 7 0 0 0 12 5" />
                                        <line x1="2" x2="22" y1="2" y2="22" />
                                    </template>
                                </svg>
                            </button>

                            <!-- Screen share -->
                            <button
                                class="control-btn"
                                :class="{ active: mediaState.isScreenSharing }"
                                @click="toggleScreenShare"
                                title="Chia sẻ màn hình"
                            >
                                <svg
                                    class="icon-md"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <template v-if="mediaState.isScreenSharing">
                                        <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                                        <line x1="8" x2="16" y1="21" y2="21"></line>
                                        <line x1="12" x2="12" y1="17" y2="21"></line>
                                    </template>
                                    <template v-else>
                                        <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                                        <path d="M10 13l2-2 2 2"></path>
                                    </template>
                                </svg>
                            </button>

                            <!-- Fullscreen Toggle -->
                            <button
                                class="control-btn"
                                @click="toggleFullscreen"
                                :title="uiState.isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'"
                            >
                                <svg
                                    class="icon-md"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <template v-if="uiState.isFullscreen">
                                        <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                                        <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                                        <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                                        <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                                    </template>
                                    <template v-else>
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                                        <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                                        <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                                        <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                                    </template>
                                </svg>
                            </button>

                            <!-- Leave -->
                            <button
                                class="control-btn danger"
                                @click="onLeaveClassroom"
                                title="Rời khỏi lớp học"
                            >
                                <svg
                                    class="icon-md"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </button>

                            <div class="separator"></div>

                            <!-- Hide Controls -->
                            <button class="control-btn secondary" @click="hideControls" title="Ẩn thanh công cụ">
                                <svg class="icon-md" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                        </div>
                    </Transition>

                    <Transition name="fade">
                        <div class="floating-controls-wrapper mini" v-if="!uiState.controlsVisible">
                             <button class="control-btn" @click="showControls" title="Hiện thanh công cụ">
                                <svg class="icon-md" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                            </button>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Global Reset for this component */
* {
    box-sizing: border-box;
}

/* Main Container - Dark Theme for Video Call */
.classroom-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #0f172a; /* Slate 900 */
    background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 75%);
    color: #f8fafc;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
}

/* Access Denied Styles */
.access-denied {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    background: #0f172a;
}

.access-denied-content {
    text-align: center;
    max-width: 500px;
    padding: 3rem;
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.access-denied-icon {
    color: #ef4444;
    margin-bottom: 1.5rem;
    display: inline-flex;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
}

.access-denied-title {
    color: #f1f5f9;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
}

.access-denied-message {
    color: #94a3b8;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    line-height: 1.6;
}

.access-denied-subtitle {
    color: #64748b;
    margin-bottom: 2rem;
    font-size: 0.9rem;
}

.access-denied-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--color-primary);
    color: white;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.2s;
}

.access-denied-btn:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

/* Main Classroom Interface */
.classroom-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    max-width: 1920px;
    margin: 0 auto;
    width: 100%;
    height: 100%;
}

/* Header Section */
.classroom-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.classroom-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
    letter-spacing: -0.01em;
}

.classroom-subtitle {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.fancy-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #cbd5e1;
    font-size: 0.9rem;
    font-weight: 500;
}

.play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    z-index: 10;
    cursor: pointer;
    backdrop-filter: blur(2px);
}

.play-overlay .icon-xl {
    width: 64px;
    height: 64px;
    color: rgba(255, 255, 255, 0.9);
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
    transition: transform 0.2s;
}

.play-overlay:hover .icon-xl {
    transform: scale(1.1);
    color: #fff;
}

.participants-icon {
    color: #fbbf24;
}

.settings-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(30, 41, 59, 0.4);
    color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.settings-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

/* Video Section */
.video-section {
    flex: 1;
    position: relative;
    min-height: 0;
    border-radius: 20px;
    overflow: hidden;
    background: #020617; /* Darker background for video area */
    box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
}

.video-grid {
    width: 100%;
    height: 100%;
    display: grid;
    gap: 1rem;
    padding: 1rem;
    transition: all 0.3s ease;
}

/* Layout Modes */
.video-grid.layout-split {
    grid-template-columns: 1fr 1fr;
    align-items: center;
}

.video-grid.layout-pinned {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
}

.video-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1e293b;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
}

/* Pinned Layout Specifics */
.video-grid.layout-pinned .is-primary {
    z-index: 1;
}

.video-grid.layout-pinned .is-secondary {
    position: absolute;
    right: 2.5rem;
    bottom: 2rem; /* Space for controls */
    width: 280px;
    height: 158px;
    z-index: 20;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1);
    border-radius: 12px;
}

.video-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    background: #000;
}

.video-element {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Ensure video isn't cut off */
    background: #000;
    pointer-events: none; /* Prevent user interaction (pausing) on mobile */
}

/* Video Overlays */
.video-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1e293b;
    z-index: 2;
}

.overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: #64748b;
}

.overlay-text {
    font-size: var(--font-size-mini);
    font-weight: 500;
}

/* In-Video Controls (Hover) */
.layout-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.2s ease;
    z-index: 10;
}

.video-container:hover .layout-controls {
    opacity: 1;
    transform: translateY(0);
}

.layout-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.layout-btn:hover {
    background: rgba(0, 0, 0, 0.8);
}

.layout-btn.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
}

/* Video Labels & Badges */
.video-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 0.5rem;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
    display: flex;
    /* justify-content: space-between; */
    align-items: flex-start;
    z-index: 5;
}

.video-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
}

.label-text {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: left;
}

.label-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.label-indicator.local { background: #10b981; box-shadow: 0 0 8px #10b981; }
.label-indicator.remote { background: var(--color-primary); box-shadow: 0 0 8px var(--color-primary); }

.mute-badge {
    background: rgba(239, 68, 68, 0.9);
    color: white;
    padding: 0.35rem;
    border-radius: 6px;
    display: flex;
}

/* Floating Control Bar */
.floating-controls {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    width: auto;
    pointer-events: none; /* Allow hover to pass through to video section */
}

.floating-controls-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
    pointer-events: auto; /* Re-enable pointer events for the wrapper */
}

.floating-controls-wrapper:hover {
    background: rgba(15, 23, 42, 0.95);
    box-shadow: 0 25px 50px -10px rgba(0, 0, 0, 0.5);
}

.control-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%; /* Circular buttons are more modern */
    border: none;
    background: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
    color: #fff;
}

.control-btn:active {
    transform: scale(0.95);
}

/* Active State (e.g., Mic On) - Optional: Invert logic if preferred, but standard is:
   Gray/Red = Off/Problem
   Color/White = On/Active
   Here we use:
   - Default (Gray): Off/Neutral
   - Active (Blue/Green): On
   - Danger (Red): Hangup
*/

/* Specific Button States */
.control-btn.active {
    background: var(--color-primary);
    color: white;
}

/* For Mic/Cam, usually "Active" means ON. 
   If the user wants "Active" to mean "Muted" (red), we can adjust.
   Based on template logic: :class="{ active: mediaState.micEnabled }"
   So Active = Enabled = Good.
*/

.control-btn.danger {
    background: #ef4444;
    color: white;
    border-radius: 32px;
}

.control-btn.danger:hover {
    background: #dc2626;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
}

/* Tooltips */
.control-btn[title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 10px;
    padding: 0.4rem 0.8rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 0.75rem;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 1;
}

/* Fullscreen Mode */
.video-section.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    border-radius: 0;
    background: #000;
}

.video-section.is-fullscreen .video-grid {
    padding: 0;
    height: 100%;
}

.video-section.is-fullscreen .floating-controls {
    bottom: 3rem;
    opacity: 0;
    transition: opacity 0.3s;
}

.video-section.is-fullscreen:hover .floating-controls {
    opacity: 1;
}

/* Minimized State */
.video-container.is-minimized {
    height: auto !important;
    aspect-ratio: unset !important;
    min-height: 60px;
    flex: 0 0 auto;
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.video-container.is-minimized .video-wrapper {
    height: 60px;
    background: transparent;
}

.video-container.is-minimized .video-element,
.video-container.is-minimized .video-overlay {
    display: none;
}

.video-container.is-minimized .layout-controls {
    opacity: 1;
    transform: translateY(-50%);
    top: 50%;
    right: 1rem;
}

.video-container.is-minimized .video-controls {
    display: none;
}

.video-container.is-minimized .video-label {
    background: transparent;
    padding: 0;
    backdrop-filter: none;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Separator */
.separator {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    margin: 0 0.25rem;
}

.control-btn.secondary {
    background: transparent;
    border: none;
}
.control-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .classroom-main {
        padding: 0.5rem;
    }
    
    .video-grid.layout-split {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
    }

    .video-grid.layout-pinned .is-secondary {
        width: 180px;
        height: 180px;
    }

	.video-grid.layout-pinned .is-secondary .layout-btn span {
        display: none; /* Hide text on small secondary video */
    }
    
    .floating-controls-wrapper {
        padding: 0.5rem 1rem;
        gap: 0.5rem;
    }
    
    .control-btn {
        width: 40px;
        height: 40px;
    }
    
    .control-btn.danger {
        width: 50px;
    }

	.label-text {
		width: 70px;
	}
}

@media (max-width: 640px) {
    .classroom-header {
        padding: 0.75rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .header-right {
        width: 100%;
        justify-content: space-between;
    }
    
    .video-grid.layout-pinned .is-secondary {
        width: 120px;
        height: 120px;
        aspect-ratio: 3/4;
        bottom: 1.5rem;
        right: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
    }

    .video-grid.layout-pinned .is-secondary .layout-controls {
        top: 0.5rem;
        right: 0.5rem;
        transform: none;
        opacity: 1; /* Always show controls on mobile for secondary */
    }
    
    .video-grid.layout-pinned .is-secondary .layout-btn {
        padding: 0.3rem;
    }

	.floating-controls {
		bottom: 1.5rem;
	}

	.label-text {
		width: 50px;
	}
}
</style>
