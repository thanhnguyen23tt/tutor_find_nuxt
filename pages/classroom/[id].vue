<script setup>
definePageMeta({
	name: 'classroom',
  	middleware: 'auth',
	layout: false
});

import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'

// ===== Dynamic Import Peer =====
let Peer
if (process.client) {
    const module = await import('simple-peer')
    Peer = module.default
}

// ===== Composables & Instances =====
const route = useRoute()
const { api } = useApi()
const { error: notifyError } = useNotification()
const { status_classroom: statusClassroom } = useConfig()
const userStore = useUserStore()

// ===== Constants =====
const MEDIA_CONSTRAINTS = {
    video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } },
    audio: true
}

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]
const MOBILE_BREAKPOINT = 1024

const CONSTANTS = {
    labels: {
        self: 'Bạn',
        waiting: 'Chờ...',
        participants: 'người tham gia',
        bookingCode: 'Mã booking'
    },
    titles: {
        settings: 'Cài đặt',
        splitMode: 'Chế độ 50/50',
        pinMyScreen: 'Ghim màn hình của tôi',
        pinRemoteScreen: 'Ghim màn hình đối phương',

        fullscreen: 'Toàn màn hình',
        exitFullscreen: 'Thoát toàn màn hình',
        toggleCamera: 'Bật/Tắt camera',
        cameraOn: 'Tắt camera',
        cameraOff: 'Bật camera',
        toggleMic: 'Bật/Tắt mic',
        micOn: 'Tắt mic',
        micOff: 'Bật mic',
        micMuted: 'Mic tắt',
        shareScreen: 'Chia sẻ màn hình',
        leaveClassroom: 'Rời khỏi lớp học',
        hideControls: 'Ẩn thanh công cụ',
        showControls: 'Hiện thanh công cụ'
    },
    messages: {
        classroomNotStarted: 'Lớp học chưa đến giờ bắt đầu.',
        classroomEnded: 'Lớp học đã kết thúc.',
        waitingForTutor: 'Lớp học chưa bắt đầu. Vui lòng chờ gia sư bắt đầu lớp học.',
        cannotAccess: 'Không thể truy cập lớp học',
        redirectMessage: 'Bạn sẽ được chuyển về trang quản lý lớp học trong giây lát...',
        loadError: 'Không thể tải thông tin lớp học',
        defaultTitle: 'Lớp học trực tuyến',
        cameraOff: 'Camera đã tắt',
        waitingConnection: 'Chờ kết nối...',
        waitingVideo: 'Đang chờ video...'
    },
    buttons: {
        backToManager: 'Quay lại trang quản lý',
        splitLayout: '50/50',
        pin: 'Ghim'
    }
}

// ===== Consolidated State =====
const state = reactive({
    // Media
    localStream: null,
    screenStream: null,
    micEnabled: true,
    camEnabled: true,
    isScreenSharing: false,
    
    // WebRTC
    peer: null,
    targetUid: '',
    peerName: '',
    lastSentSdp: '',
    hasStarted: false,
    remoteStreamPresent: false,
    
    // Classroom
    classroom: null,
    isLoading: false,
    canAccess: true,
    participantsCount: 1,
    
    // UI
    layoutMode: 'split',
    pinnedTarget: 'local',
    isMobile: false,
    joinSoundEnabled: true,
    isFullscreen: false,
    videoPaused: { local: true, remote: true },
    controlsVisible: false
})

// ===== Refs =====
const localVideo = ref(null)
const remoteVideo = ref(null)
const localVideoContainer = ref(null)
const remoteVideoContainer = ref(null)
const videoSectionRef = ref(null)
const audioContext = ref(null)

// ===== Socket =====
let socket = null
let controlsTimer = null

// ===== Computed =====
const userData = computed(() => userStore.getUserData)

const labels = computed(() => ({
    self: CONSTANTS.labels.self,
    peer: state.peerName || CONSTANTS.labels.waiting
}))

const isLocalVideoOn = computed(() => {
    const track = state.localStream?.getVideoTracks?.()?.[0]
    return !!(track?.enabled)
})

const checkStatusClassroom = computed(() => {
    if (!state.classroom) return CONSTANTS.messages.classroomNotStarted

    const { status } = state.classroom

    if (status === statusClassroom.ended) return CONSTANTS.messages.classroomEnded
    if (status !== statusClassroom.started) return CONSTANTS.messages.waitingForTutor

    return CONSTANTS.messages.classroomNotStarted
})

// ===== Classroom Methods =====
async function loadClassroom() {
    state.isLoading = true

    try {
        const id = route.params.id
        const res = await api.apiGet(`classrooms/${id}`)

        if (!res?.success) {
            state.classroom = { id }
            return false
        }

        state.classroom = res.data

        const validationResult = validateClassroomAccess(res)
        if (!validationResult.canAccess) {
            notifyError(validationResult.message)
            state.canAccess = false
            return false
        }

        return true
    } catch (error) {
        state.classroom = { id: route.params.id }
        notifyError(CONSTANTS.messages.loadError)
        state.canAccess = false
        return false
    } finally {
        state.isLoading = false
    }
}

function validateClassroomAccess(response) {
    const { data } = response

    if (data.status === statusClassroom.ended) {
        return { canAccess: false, message: CONSTANTS.messages.classroomEnded }
    }

    if (data.status !== statusClassroom.started) {
        return { canAccess: false, message: CONSTANTS.messages.waitingForTutor }
    }

    if (response.time_info?.can_start === false) {
        return { canAccess: false, message: response.time_info.time_status_text }
    }

    return { canAccess: true }
}

// ===== Socket.IO & WebRTC Methods =====
async function initSocketIO() {
    try {
        if (!process.client) return

        const { initSocket, getSocket } = await import('~/composables/useSocket')
        
        socket = getSocket()
        if (!socket?.connected) {
            await initSocket()
            socket = getSocket()
        }

        if (!socket) {
            console.error('Socket.IO not available')
            return
        }

        socket.emit('classroom:join', { classroomId: state.classroom.id })

        // Bind event listeners
        socket.on('classroom:joined', handleClassroomJoined)
        socket.on('classroom:users_present', handleUsersPresent)
        socket.on('classroom:user_joined', handleUserJoining)
        socket.on('classroom:user_left', handleUserLeaving)
        socket.on('webrtc:signal', handleSignal)

        console.log('✅ Socket.IO classroom initialized')
    } catch (error) {
        console.error('Failed to join classroom:', error)
    }
}

function cleanupSocketIO() {
    if (socket) {
        socket.off('classroom:joined', handleClassroomJoined)
        socket.off('classroom:users_present', handleUsersPresent)
        socket.off('classroom:user_joined', handleUserJoining)
        socket.off('classroom:user_left', handleUserLeaving)
        socket.off('webrtc:signal', handleSignal)
    }
}

function handleClassroomJoined(data) {
    console.log(data, 'handleClassroomJoined')
    if (data.participantCount !== undefined) {
        state.participantsCount = data.participantCount
    }
}

function handleUsersPresent(data) {
    const users = Array.isArray(data) ? data : (data.users || [])
    const participantCount = data.participantCount !== undefined ? data.participantCount : users.length
    
    state.participantsCount = participantCount

    const other = users.find(u => u.id !== userData.value?.uid)
    if (other) {
        state.targetUid = other.id
        state.peerName = other.name || ''
    }

    if (participantCount >= 2) createPeer(true)
}

function handleUserJoining(data) {
	console.log(data, 'handleUserJoining')
    if (data.participantCount !== undefined) {
        state.participantsCount = data.participantCount
    }

    const user = data.user || data
    if (user.id !== userData.value?.uid) {
        state.targetUid = user.id
        state.peerName = user.name || ''
        
        if (!state.peer && state.localStream) {
            console.log('📞 Creating peer connection to new user:', user.id)
            createPeer(true)
        }
    }

    playJoinSound()
}

function handleUserLeaving(data) {
    if (data && data.participantCount !== undefined) {
        state.participantsCount = data.participantCount
    }
    state.remoteStreamPresent = false
}

function handleSignal(e) {
	console.log('📥 Received WebRTC signal:', e.data)
    if (e.from === userData.value?.uid) return

    if (e.from && !state.targetUid) {
        state.targetUid = e.from
        console.log(`🎯 Set target user ID from signal: ${e.from}`)
    }

    const signalData = e.data;

    if (!signalData) {
        return
    }

    if (!state.peer || state.peer.destroyed) {
        createPeer(false)
    }

    if (state.peer && !state.peer.destroyed) {
        try {
            state.peer.signal(signalData)
        } catch (error) {
            console.error('❌ Error signaling peer:', error)
        }
    }
}

function playJoinSound() {
    if (!process.client || !state.joinSoundEnabled) return

    try {
        if (!audioContext.value) {
            audioContext.value = new(window.AudioContext || window.webkitAudioContext)()
        }

        const ctx = audioContext.value
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

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
async function ensureVideoPlayback(videoRef, stream, { muted = false } = {}) {
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

    if (videoRef === localVideo) state.videoPaused.local = element.paused
    if (videoRef === remoteVideo) state.videoPaused.remote = element.paused
}

function handleVideoPause(event, target) {
    state.videoPaused[target] = true
    
    const video = event.target
    if (video && !video.ended && video.paused) {
        video.play().catch(() => {})
    }
}

function handleVideoPlay(event, target) {
    state.videoPaused[target] = false
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
        state.localStream = stream

        await ensureVideoPlayback(localVideo, stream, { muted: true })

        if (state.participantsCount >= 2) {
            createPeer(true)
        }
    } catch (error) {
        console.error('Media access error:', error)
    }
}

async function toggleScreenShare() {
    if (!process.client || !state.peer) return

    if (!state.isScreenSharing) {
        await startScreenShare()
    } else {
        await stopScreenShare()
    }
}

async function startScreenShare() {
    try {
        state.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = state.screenStream.getVideoTracks()[0]

        const sender = state.peer._pc.getSenders().find(s => s.track?.kind === 'video')

        if (sender) {
            await sender.replaceTrack(screenTrack)
            await ensureVideoPlayback(localVideo, state.screenStream, { muted: true })
            state.isScreenSharing = true
            screenTrack.onended = () => toggleScreenShare()
        }
    } catch (error) {
        console.error('Screen share error:', error)
    }
}

async function stopScreenShare() {
    const camTrack = state.localStream?.getVideoTracks()[0]

    if (camTrack) {
        const sender = state.peer._pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
            await sender.replaceTrack(camTrack)
        }
    }

    state.screenStream?.getTracks().forEach(t => t.stop())

    await ensureVideoPlayback(localVideo, state.localStream, { muted: true })

    state.isScreenSharing = false
}

function toggleMic() {
    state.micEnabled = !state.micEnabled
    state.localStream?.getAudioTracks().forEach(t => {
        t.enabled = state.micEnabled
    })
}

function toggleCamera() {
    state.camEnabled = !state.camEnabled
    state.localStream?.getVideoTracks().forEach(t => {
        t.enabled = state.camEnabled
    })
}

// ===== Peer Methods =====
function createPeer(initiator) {
    if (!Peer || !state.localStream || state.peer) return

    state.peer = new Peer({
        initiator,
        trickle: false,
        stream: state.localStream,
        config: { iceServers: ICE_SERVERS },
        reconnectTimer: 3000
    })

    state.peer.on('signal', handlePeerSignal)
    state.peer.on('connect', handlePeerConnect)
    state.peer.on('stream', handlePeerStream)
    state.peer.on('close', handlePeerClose)
    state.peer.on('error', handlePeerError)
}

async function handlePeerSignal(data) {
    try {
        if (data?.sdp && state.lastSentSdp === data.sdp) return

        if (data?.sdp) {
            state.lastSentSdp = data.sdp
        }

        if (!state.targetUid) {
            console.warn('⚠️ No target user ID, cannot send WebRTC signal')
            return
        }

        if (socket && socket.connected) {
            if (data.type === 'offer' || (data.sdp && data.sdp.includes('offer'))) {
                socket.emit('webrtc:offer', {
                    offer: data,
                    classroomId: state.classroom.id,
                    to: state.targetUid
                })
            } else if (data.type === 'answer' || (data.sdp && data.sdp.includes('answer'))) {
                socket.emit('webrtc:answer', {
                    answer: data,
                    classroomId: state.classroom.id,
                    to: state.targetUid
                })
            } else if (data.candidate) {
                socket.emit('webrtc:ice-candidate', {
                    candidate: data,
                    classroomId: state.classroom.id,
                    to: state.targetUid
                })
            } else {
                socket.emit('webrtc:signal', {
                    signalType: data.type || 'unknown',
                    signalData: data,
                    classroomId: state.classroom.id,
                    to: state.targetUid
                })
            }
            
            console.log(`📡 WebRTC signal sent to ${state.targetUid}:`, data.type || 'signal')
        } else {
            console.error('Socket not connected, cannot send WebRTC signal')
        }
    } catch (error) {
        console.error('Signal send error:', error)
    }
}

function handlePeerConnect() {
    if (!state.hasStarted) {
        state.hasStarted = true
    }
}

async function handlePeerStream(remote) {
    console.log('Remote stream received:', remote)
    
    await nextTick()
    
    if (!remoteVideo.value) {
        console.error('Remote video element not ready')
        setTimeout(() => {
            if (remoteVideo.value && remote) {
                ensureVideoPlayback(remoteVideo, remote)
                state.remoteStreamPresent = true
            }
        }, 100)
        return
    }
    
    state.remoteStreamPresent = true
    await ensureVideoPlayback(remoteVideo, remote)
}

function handlePeerClose() {
    console.log('Peer connection closed')
    state.remoteStreamPresent = false
    destroyPeer()
}

function handlePeerError(error) {
    console.error('Peer error:', error)
    state.remoteStreamPresent = false
    destroyPeer()
}

function destroyPeer() {
    if (state.peer) {
        try {
            state.peer.destroy()
        } catch {}
        state.peer = null
    }
}

// ===== Layout Methods =====
function setLayout(mode) {
    if (!['split', 'pinned'].includes(mode)) return
    if (state.isMobile && mode === 'split') return

    state.layoutMode = mode
}

function pinLocal() {
    state.layoutMode = 'pinned'
    state.pinnedTarget = 'local'
}

function pinRemote() {
    state.layoutMode = 'pinned'
    state.pinnedTarget = 'remote'
}

function updateMobileStatus() {
    if (typeof window !== 'undefined') {
        state.isMobile = window.innerWidth < MOBILE_BREAKPOINT
    }
}

function checkAndAdjustLayoutForMobile() {
    updateMobileStatus()

    if (state.isMobile && state.layoutMode === 'split') {
        state.layoutMode = 'pinned'
        state.pinnedTarget = 'local'
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
        } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen()
        } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            await document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
            await document.msExitFullscreen()
        }
    }
}

function onFullscreenChange() {
    state.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)

    if (!state.isFullscreen) {
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
            if (element.requestFullscreen) {
                await element.requestFullscreen()
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen()
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen()
            } else if (element.querySelector('video') && state.isMobile) {
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



// ===== Session Methods =====
async function onLeaveClassroom() {
    if (process.client) {
        window.close()
    }
}

// ===== Cleanup =====
async function cleanup() {
    state.localStream?.getTracks().forEach(t => t.stop())
    state.screenStream?.getTracks().forEach(t => t.stop())

    destroyPeer()
    cleanupSocketIO()

    if (audioContext.value) {
        audioContext.value.close()
    }
}

// ===== Control Visibility =====
function handleToggleControls(event) {
    if (event.target.closest('button') || event.target.closest('.layout-controls')) return

    if (state.isMobile) {
        if (state.controlsVisible) {
            hideControls()
        } else {
            showControls()
        }
    }
}

function showControls() {
    state.controlsVisible = true
    
    if (controlsTimer) clearTimeout(controlsTimer)
    
    if (state.isMobile) {
        controlsTimer = setTimeout(() => {
            state.controlsVisible = false
        }, 3000)
    }
}

function hideControls() {
    if (controlsTimer) clearTimeout(controlsTimer)
    state.controlsVisible = false
}

// ===== Lifecycle =====
onMounted(async () => {
    updateMobileStatus()

    // Show floating controls by default on desktop
    if (!state.isMobile) {
        state.controlsVisible = true
    }

    const canAccess = await loadClassroom()

    if (canAccess) {
        await startMedia()
        await initSocketIO()
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
</script>

<template>
    <base-loading v-if="state.isLoading" />

    <div class="classroom-container" v-if="!state.isLoading">
        <BasePageError v-if="!state.classroom?.booking" message="Lớp học không tồn tại hoặc có lỗi xảy ra" />

        <!-- Access denied message -->
        <div v-else-if="!state.classroom.can_start" class="access-denied">
            <div class="access-denied-content">
                <div class="access-denied-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-max-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m4.9 4.9 14.2 14.2"></path>
                    </svg>
                </div>
                <h2 class="access-denied-title">{{ CONSTANTS.messages.cannotAccess }}</h2>
                <p class="access-denied-message">{{ checkStatusClassroom }}</p>
                <p class="access-denied-subtitle">{{ CONSTANTS.messages.redirectMessage }}</p>
                <NuxtLink to="/classroom/manager" class="access-denied-btn">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9,22 9,12 15,12 15,22"></polyline>
                    </svg>
                    {{ CONSTANTS.buttons.backToManager }}
                </NuxtLink>
            </div>
        </div>

        <!-- Main classroom interface -->
        <div v-else class="classroom-main">
            <!-- Header Section -->
            <div class="classroom-header">
                <div class="header-left">
                    <div class="classroom-info" v-if="state.classroom">
                        <h3 class="classroom-title">{{ state.classroom.topic || CONSTANTS.messages.defaultTitle }}</h3>
                        <p class="classroom-subtitle">{{ CONSTANTS.labels.bookingCode }}: {{ state.classroom.booking?.request_code }}</p>
                    </div>
                </div>

                <div class="header-right">
                    <div class="participants-info fancy-chip">
                        <svg class="participants-icon icon-sm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span class="count">{{ state.participantsCount }}</span>
                        <span class="label">{{ CONSTANTS.labels.participants }}</span>
                    </div>

                    <div class="header-actions">
                        <button class="settings-btn" :title="CONSTANTS.titles.settings">
                            <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Video Section -->
            <div class="video-section" ref="videoSectionRef" :class="{ 'is-fullscreen': state.isFullscreen }" @click="handleToggleControls">
                <div class="video-grid" :class="[`layout-${state.layoutMode}`, { 'controls-visible': state.controlsVisible }]">
                    <!-- Local Video -->
                    <div class="video-container local-video" ref="localVideoContainer" :class="{ 
                        'is-primary': state.layoutMode === 'pinned' && state.pinnedTarget === 'local', 
                        'is-secondary': state.layoutMode === 'pinned' && state.pinnedTarget === 'remote'
                    }">
                        <div class="video-wrapper">
                            <video ref="localVideo" autoplay playsinline webkit-playsinline muted class="video-element" @pause="e => handleVideoPause(e, 'local')" @play="e => handleVideoPlay(e, 'local')" oncontextmenu="return false;"></video>
                            <div v-if="state.videoPaused.local" class="play-overlay" @click.stop="retryPlay('local')">
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
                                    <p class="overlay-text">{{ CONSTANTS.messages.cameraOff }}</p>
                                </div>
                            </div>

                            <!-- Layout Controls -->
                            <div class="layout-controls">
                                <button 
                                    class="layout-btn" 
                                    :class="{ active: state.layoutMode === 'split' }" 
                                    @click="setLayout('split')" 
                                    :title="CONSTANTS.titles.splitMode"
                                    v-if="!state.isMobile"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="5" width="8" height="14" rx="2"></rect>
                                        <rect x="13" y="5" width="8" height="14" rx="2"></rect>
                                    </svg>
                                    <span>{{ CONSTANTS.buttons.splitLayout }}</span>
                                </button>
                                <button 
                                    class="layout-btn" 
                                    :class="{ active: state.layoutMode === 'pinned' && state.pinnedTarget === 'local' }" 
                                    @click="pinLocal" 
                                    :title="CONSTANTS.titles.pinMyScreen"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="4" width="20" height="14" rx="2"></rect>
                                        <rect x="14" y="12" width="8" height="6" rx="2"></rect>
                                    </svg>
                                    <span>{{ CONSTANTS.buttons.pin }}</span>
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
                                    <div v-if="!state.micEnabled" class="badge mute-badge" :title="CONSTANTS.titles.micMuted">
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
                        'is-primary': state.layoutMode === 'pinned' && state.pinnedTarget === 'remote', 
                        'is-secondary': state.layoutMode === 'pinned' && state.pinnedTarget === 'local'
                    }">
                        <div class="video-wrapper">
                            <video ref="remoteVideo" autoplay playsinline webkit-playsinline class="video-element" @pause="e => handleVideoPause(e, 'remote')" @play="e => handleVideoPlay(e, 'remote')" oncontextmenu="return false;"></video>
                            <div v-if="state.videoPaused.remote && state.remoteStreamPresent" class="play-overlay" @click.stop="retryPlay('remote')">
                                <svg class="icon-xl" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                            <div v-if="!state.remoteStreamPresent" class="video-overlay">
                                <div class="overlay-content">
                                    <svg class="overlay-icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                                        <rect x="2" y="6" width="14" height="12" rx="2" />
                                    </svg>
                                    <p class="overlay-text" v-if="!state.hasStarted">{{ CONSTANTS.messages.waitingConnection }}</p>
                                    <p class="overlay-text" v-else>{{ CONSTANTS.messages.waitingVideo }}</p>
                                </div>
                            </div>

                            <!-- Layout Controls for remote -->
                            <div class="layout-controls">
                                <button 
                                    class="layout-btn" 
                                    :class="{ active: state.layoutMode === 'pinned' && state.pinnedTarget === 'remote' }" 
                                    @click="pinRemote" 
                                    :title="CONSTANTS.titles.pinRemoteScreen"
                                >
                                    <svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="4" width="20" height="14" rx="2"></rect>
                                        <rect x="14" y="12" width="8" height="6" rx="2"></rect>
                                    </svg>
                                    <span>{{ CONSTANTS.buttons.pin }}</span>
                                </button>

                                <button 
                                    class="layout-btn" 
                                    @click="toggleElementFullscreen(remoteVideoContainer)" 
                                    :title="CONSTANTS.titles.fullscreen"
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
                <div class="floating-controls">
                    <Transition name="slide-up">
                        <div class="floating-controls-wrapper" v-if="state.controlsVisible">
                            <!-- Camera -->
                            <button
                                class="control-btn"
                                :class="{ active: state.camEnabled }"
                                @click="toggleCamera"
                                :title="state.camEnabled ? CONSTANTS.titles.cameraOn : CONSTANTS.titles.cameraOff"
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
                                    <template v-if="state.camEnabled">
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
                                :class="{ active: state.micEnabled }"
                                @click="toggleMic"
                                :title="state.micEnabled ? CONSTANTS.titles.micOn : CONSTANTS.titles.micOff"
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
                                    <template v-if="state.micEnabled">
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
                                :class="{ active: state.isScreenSharing }"
                                @click="toggleScreenShare"
                                :title="CONSTANTS.titles.shareScreen"
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
                                    <template v-if="state.isScreenSharing">
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
                                :title="state.isFullscreen ? CONSTANTS.titles.exitFullscreen : CONSTANTS.titles.fullscreen"
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
                                    <template v-if="state.isFullscreen">
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
                                :title="CONSTANTS.titles.leaveClassroom"
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
                            <!-- Hide Controls -->
                            <button class="control-btn secondary" @click="hideControls" :title="CONSTANTS.titles.hideControls" v-if="state.isMobile">
                                <svg class="icon-md" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
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
/* Main Container - Dark Theme for Video Call */
.classroom-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: black;
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
    background: black;
    backdrop-filter: blur(12px);
    border-radius: 16px;
    border: 1px solid #333333;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.classroom-title {
    font-size: var(--font-size-heading-5);
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
    border: 1px solid #333333;
    transition: all 0.3s ease;
}

/* Pinned Layout Specifics */
.video-grid.layout-pinned .is-primary {
    z-index: 1;
}

.video-grid.layout-pinned .is-secondary {
    position: absolute;
    right: 1rem;
    bottom: 1rem; /* Space for controls */
    width: 300px;
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
    bottom: 1rem;
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
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 3rem;
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
   Based on template logic: :class="{ active: state.micEnabled }"
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
    bottom: 1rem;
    opacity: 0;
    transition: opacity 0.3s;
}

.video-section.is-fullscreen:hover .floating-controls {
    opacity: 1;
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
        width: 160px;
        height: 160px;
    }

	.video-grid.layout-pinned .is-secondary .layout-btn span {
        display: none; /* Hide text on small secondary video */
    }
    
    .floating-controls-wrapper {
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
        bottom: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
        transition: bottom 0.3s ease;
    }

    .video-grid.layout-pinned.controls-visible .is-secondary {
        bottom: 5.5rem;
    }
    
    .video-grid.layout-pinned .is-secondary .layout-btn {
        padding: 0.3rem;
    }

	.floating-controls {
		bottom: 1rem;
	}

	.label-text {
		width: 50px;
	}
}
</style>