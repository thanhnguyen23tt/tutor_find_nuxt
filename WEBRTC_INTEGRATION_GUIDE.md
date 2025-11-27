# Hướng Dẫn Tích Hợp WebRTC Adapter vào Classroom Page

## Tổng quan
Hệ thống WebRTC đã được tách thành các composables riêng biệt cho từng trình duyệt:
- `useWebRTCChrome.js` - Tối ưu cho Chrome và Firefox
- `useWebRTCSafari.js` - Tối ưu cho Safari với các workaround cụ thể
- `useWebRTCEdge.js` - Tối ưu cho Microsoft Edge
- `useWebRTCAdapter.js` - Auto-select implementation dựa trên browser
- `useBrowserDetection.js` - Phát hiện trình duyệt

## Các Thay Đổi Trong pages/classroom/[id].vue

### 1. Import composables mới
Thêm vào đầu file (sau các import hiện tại):

```javascript
// Browser-specific WebRTC
const { browserInfo } = useBrowserDetection();
```

### 2. Thay thế các function WebRTC
Thay thế các function sau bằng cách sử dụng WebRTC adapter:

**TÌM VÀ THAY THẾ:**

```javascript
// Tìm đoạn code này (khoảng dòng 350-580):
// ===== Media Methods =====
async function ensureVideoPlayback(videoRef, stream, { muted = false } = {}) {
    // ... existing code ...
}

async function startMedia() {
    // ... existing code ...
}

// ... các function media khác ...

// ===== Peer Methods =====
function createPeer(initiator) {
    // ... existing code ...
}

// ... các function peer khác ...
```

**THAY BẰNG:**

```javascript
// ===== WebRTC Adapter =====
const webrtcAdapter = useWebRTCAdapter({
    mediaState,
    webrtcState,
    uiState,
    localVideo,
    remoteVideo,
    MEDIA_CONSTRAINTS,
    ICE_SERVERS,
    onPeerSignal: handlePeerSignal,
    onPeerConnect: handlePeerConnect,
    onPeerClose: handlePeerClose,
    onPeerError: handlePeerError
});

// Destructure methods from adapter
const {
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
} = webrtcAdapter;
```

### 3. Giữ nguyên các callback handlers
Các function sau cần giữ nguyên vì chúng được sử dụng làm callbacks:

```javascript
async function handlePeerSignal(data) {
    try {
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
```

### 4. Update toggleScreenShare function
```javascript
async function toggleScreenShare() {
    if (!process.client || !webrtcState.peer) return
    
    if (!mediaState.isScreenSharing) {
        await startScreenShare()
    } else {
        await stopScreenShare()
    }
}
```

## Lợi ích của refactor này

### 1. Tối ưu hóa theo từng browser
- **Safari**: 
  - Thêm delays cần thiết cho video playback
  - Sử dụng webkit-playsinline attribute
  - Lower framerate cho stability
  - Longer reconnect timers

- **Chrome**: 
  - Autoplay policies tốt hơn
  - Hỗ trợ cursor tracking trong screen share
  - Framerates cao hơn

- **Edge**: 
  - Similar to Chrome nhưng với unified-plan SDP
  - Optimized framerates
  - Better audio handling

### 2. Dễ maintain và debug
- Code được tách riêng theo browser
- Dễ dàng thêm browser-specific fixes
- Console logs có prefix browser name

### 3. Fallback tự động
- Nếu browser không được nhận diện, sẽ fallback về Chrome implementation
- Firefox sẽ sử dụng Chrome implementation (tương thích tốt)

## Testing

### 1. Test trên Chrome
```javascript
// Mở DevTools > Console, kiểm tra log:
// "Using Chrome-optimized WebRTC"
```

### 2. Test trên Safari
```javascript
// Mở Web Inspector > Console, kiểm tra log:
// "Using Safari-optimized WebRTC"
// "Safari: Remote stream received"
```

### 3. Test trên Edge
```javascript
// Mở DevTools > Console, kiểm tra log:
// "Using Edge-optimized WebRTC"
```

## Troubleshooting

### Issue: Video không play
- **Safari**: Kiểm tra user đã interact với page chưa (Safari yêu cầu user gesture)
- **Chrome/Edge**: Kiểm tra autoplay policy trong settings

### Issue: Screen share không hoạt động
- **Safari**: Safari có hỗ trợ hạn chế, cần macOS 13+
- **Edge**: Kiểm tra permissions

### Issue: Peer connection failed
- Kiểm tra STUN/TURN servers
- Xem browser-specific console logs để debug

## Future Improvements

1. Thêm Firefox-specific optimizations nếu cần
2. Thêm mobile browser detection (iOS Safari, Chrome Mobile)
3. Thêm codec preferences theo browser
4. Implement adaptive bitrate based on browser capabilities
