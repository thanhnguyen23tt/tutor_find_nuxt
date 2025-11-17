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
    peer: webrtcState.peerName || 'Đang chờ...'
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

function handlePeerStream(remote) {
    ensureVideoPlayback(remoteVideo, remote)
    webrtcState.remoteStreamPresent = true
}

function handlePeerClose() {
    destroyPeer()
}

function handlePeerError(error) {
    console.error('Peer error:', error)
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
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        window.removeEventListener('resize', checkAndAdjustLayoutForMobile)
    }

    cleanup()
})

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
})
</script>

<template>
    <base-loading v-if="classroomState.isLoading" />

    <div class="classroom-container" v-if="!classroomState.isLoading">
        <!-- Access denied message -->
        <div v-if="!classroomState.canAccess" class="access-denied">
            <div class="access-denied-content">
                <div class="access-denied-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-max-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m4.9 4.9 14.2 14.2"></path>
                    </svg>
                </div>
                <h2 class="access-denied-title">Không thể truy cập lớp học</h2>
                <p class="access-denied-message">{{ checkStatusClassroom }}</p>
                <p class="access-denied-subtitle">Bạn sẽ được chuyển về trang quản lý lớp học trong giây lát...</p>
                <NuxtLink to="/classroom-manager" class="btn-md btn-primary access-denied-btn">
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
                        <button class="action-btn settings-btn" title="Cài đặt">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Video Section -->
            <div class="video-section">
                <div class="video-grid" :class="`layout-${uiState.layoutMode}`">
                    <!-- Local Video -->
                    <div class="video-container local-video" :class="{ 
                        'is-primary': uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'local', 
                        'is-secondary': uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'remote' 
                    }">
                        <div class="video-wrapper">
                            <video ref="localVideo" autoplay playsinline muted class="video-element"></video>
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
                            <div class="layout-controls" v-if="!uiState.isMobile">
                                <button 
                                    class="layout-btn" 
                                    :class="{ active: uiState.layoutMode === 'split' }" 
                                    @click="setLayout('split')" 
                                    title="Chế độ 50/50"
                                >
                                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="4" width="20" height="14" rx="2"></rect>
                                        <rect x="14" y="12" width="8" height="6" rx="2"></rect>
                                    </svg>
                                    <span>Ghim</span>
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
                    <div class="video-container remote-video" :class="{ 
                        'is-primary': uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'remote', 
                        'is-secondary': uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'local' 
                    }">
                        <div class="video-wrapper">
                            <video ref="remoteVideo" autoplay playsinline class="video-element"></video>
                            <div v-if="!webrtcState.remoteStreamPresent" class="video-overlay">
                                <div class="overlay-content">
                                    <svg class="overlay-icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                                        <rect x="2" y="6" width="14" height="12" rx="2" />
                                    </svg>
                                </div>
                            </div>

                            <!-- Layout Controls for remote -->
                            <div class="layout-controls" v-if="!uiState.isMobile">
                                <button 
                                    class="layout-btn" 
                                    :class="{ active: uiState.layoutMode === 'pinned' && uiState.pinnedTarget === 'remote' }" 
                                    @click="pinRemote" 
                                    title="Ghim màn hình đối phương"
                                >
                                    <svg class="icon-sm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="4" width="20" height="14" rx="2"></rect>
                                        <rect x="14" y="12" width="8" height="6" rx="2"></rect>
                                    </svg>
                                    <span>Ghim</span>
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
                <div class="floating-controls">
                    <div class="floating-controls-wrapper">
                        <!-- Camera -->
                        <button
                            class="control-btn"
                            :class="{ active: mediaState.camEnabled }"
                            @click="toggleCamera"
                            :title="mediaState.camEnabled ? 'Tắt camera' : 'Bật camera'"
                        >
                            <svg
                                class="icon-lg"
                                width="20"
                                height="20"
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
                                class="icon-lg"
                                width="20"
                                height="20"
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
                                class="icon-lg"
                                width="20"
                                height="20"
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

                        <!-- Leave -->
                        <button
                            class="control-btn danger"
                            @click="onLeaveClassroom"
                            title="Rời khỏi lớp học"
                        >
                            <svg
                                class="icon-lg"
                                width="20"
                                height="20"
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
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Main Container */
.classroom-container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

/* Access Denied Styles */
.access-denied {
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 100vh;
    padding: 2rem;
}

.access-denied-content {
    text-align: center;
    max-width: 600px;
    padding: 3rem;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.access-denied-icon {
    color: #ef4444;
    margin-bottom: 2rem;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.access-denied-title {
    color: #1f2937;
    margin-bottom: 1rem;
    font-size: var(--font-size-heading-4);
    font-weight: 700;
}

.access-denied-message {
    color: #6b7280;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    line-height: 1.6;
}

.access-denied-subtitle {
    color: #9ca3af;
    margin-bottom: 2rem;
    font-size: 0.95rem;
}

/* Main Classroom Interface */
.classroom-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin: 0 auto;
    width: 100%;
}

/* Header Section */
.classroom-header {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    padding: 1.3rem;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.fancy-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.35);
    color: #334155;
}

.connection-status .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #ef4444;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    transition: all 0.3s ease;
}

.connection-status.online .dot {
    background: #10b981;
    animation: ping 1.8s infinite;
}

@keyframes ping {
    0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
    }

    70% {
        box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
}

.status-text {
    font-weight: 600;
    color: #1f2937;
    font-size: var(--font-size-small);
}

.classroom-info {
    flex: 1;
}

.classroom-title {
    font-size: var(--font-size-medium);
    font-weight: 800;
    color: #111827;
    margin: 0 0 0.2rem 0;
}

.classroom-subtitle {
    color: #6b7280;
    margin: 0;
    font-size: var(--font-size-base);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.participants-info {
    color: #92400e;
    font-size: var(--font-size-small);
}

.participants-icon {
    color: #d97706;
}

.count {
    font-weight: 600;
}

.label {
    font-size: 0.9rem;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn:hover {
    transform: translateY(-1px);
}

/* Video Section */
.video-section {
    position: relative;
    flex: 1;
    min-height: 0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    padding: 1rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.6);
}

.video-grid {
    display: grid;
    gap: 1rem;
    aspect-ratio: 20/9;
    margin: 0 auto;
}

/* Layout Modes */
.video-grid.layout-split {
    grid-template-columns: 1fr 1fr;
}

.video-grid.layout-pinned {
    position: relative;
    grid-template-columns: 1fr;
}

.video-grid.layout-pinned .is-secondary {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    width: 22%;
    max-width: 360px;
    min-width: 150px;
    z-index: 3;
    border: 2px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
    border-radius: 12px;
    overflow: hidden;
}

.video-container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: #0b1020;
    box-shadow: 0 8px 25px rgba(2, 8, 23, 0.25);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.video-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(2, 8, 23, 0.35);
}

.video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
}

.video-element {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
}

.video-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(2, 6, 23, 0.7) 0%, rgba(2, 6, 23, 0.5) 100%);
    color: white;
}

.overlay-content {
    text-align: center;
}

.overlay-icon {
    color: #9ca3af;
}

.overlay-text {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}

.video-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0.85rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 0.5rem;
}

/* Layout controls */
.layout-controls {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: flex;
    gap: 0.5rem;
    /* padding: 0.5rem; */
    opacity: 0;
    transform: translateY(-6px);
    transition: all 0.25s ease;
    pointer-events: none;
}

.local-video:hover .layout-controls,
.local-video:focus-within .layout-controls,
.remote-video:hover .layout-controls,
.remote-video:focus-within .layout-controls {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.layout-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
    color: #111827;
    border-radius: 999px;
    font-size: var(--font-size-mini);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.layout-btn:hover {
    border-color: rgba(255, 255, 255, 0.45);
    transform: translateY(-1px);
}

.layout-btn.active {
    color: #111827;
    background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
}

.video-badges {
    display: flex;
    gap: 0.5rem;
}

.badge {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.mute-badge {
    background: #ef4444;
    color: white;
}

.video-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.label-text {
    color: white;
    font-weight: 600;
    font-size: var(--font-size-small);
}

.label-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.label-indicator.local {
    background: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.label-indicator.remote {
    background: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* Floating controls */
.floating-controls {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
}

.floating-controls-wrapper {
    display: flex;
    gap: 0.6rem;
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(8px);
    border-radius: 999px;
    padding: 0.8rem 0.7rem;
    box-shadow: 0 12px 32px rgba(2, 8, 23, 0.35);
    align-items: center;
    width: max-content;
}

.control-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.8rem;
    border-radius: 999px;
    color: #e5e7eb;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    cursor: pointer;
    transition: all 0.2s ease;
}

.control-btn:hover {
    transform: translateY(-1px);
}

.control-btn.active {
    color: #111827;
    background: #ffffff;
    border-color: #ffffff;
}

.control-btn.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
}

.btn-icon {
    flex-shrink: 0;
}

/* Responsive Design */

/* Tablet (768px - 1024px) - Giống desktop */

/* Mobile (< 768px) */
@media (max-width: 1024px) {
    .classroom-container {
        padding: 0;
        height: 90vh;
    }

    .classroom-main {
        height: 100%;
        gap: 0.5rem;
        padding: 0.5rem;
    }

    .classroom-header {
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        flex-shrink: 0;
        height: max-content;
    }

    .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .header-right {
        width: 100%;
        justify-content: space-between;
    }

    .video-section {
        flex: 1;
        min-height: 0;
        padding: 0.5rem;
        border-radius: 12px;
    }

    .video-grid {
        max-height: none !important;
    }

    .video-grid {
        grid-template-columns: 1fr !important;
        gap: 1rem;
        aspect-ratio: unset;
        max-height: unset;
        height: 100%;
    }

    /* Mobile: Chỉ cho phép pinned mode, không có 50/50 */
    .video-grid.layout-split {
        grid-template-rows: 50% 50%;
    }

    /* Mobile: Pinned mode giống desktop - màn hình nhỏ ở góc phải */
    .video-grid.layout-pinned {
        position: relative;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
    }

    .video-grid.layout-pinned .is-primary {
        width: 100%;
        height: 100%;
    }

    .video-grid.layout-pinned .is-secondary {
        position: absolute;
        right: 1rem;
        bottom: 1rem;
        width: 22%;
        z-index: 3;
        border: 2px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        border-radius: 12px;
        overflow: hidden;
    }

    /* Ẩn nút 50/50 trên mobile */
    .local-video .layout-controls .layout-btn:first-child {
        display: none;
    }

    .access-denied-content {
        padding: 1.5rem;
        max-width: 100%;
    }

}
</style>
