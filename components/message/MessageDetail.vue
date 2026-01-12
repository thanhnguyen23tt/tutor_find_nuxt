<template>
	<div class="chat-main" v-show="!isMobile || !showSidebar">
		<template v-if="selectedConversation">
			<!-- Header -->
			<div class="chat-header">
				<div class="header-left">
					<button v-if="isMobile" class="btn-back" @click="$emit('back-to-sidebar')">
						<svg class="icon-md" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</button>
					<div class="header-avatar-wrapper">
						<img v-if="selectedConversation.avatar" :src="selectedConversation.avatar"
							class="header-avatar" />
						<div v-else class="header-avatar">
							{{ getFirstCharacterOfLastName(selectedConversation.name) }}
						</div>
					</div>
					<div class="header-details">
						<div class="header-name">{{ selectedConversation.name }}</div>
					</div>
				</div>
			</div>

			<!-- Messages -->
			<div class="message-list-wrapper">
				<div class="message-list" ref="messageListRef" @scroll="handleScroll">
					<div class="message-container">
						<message-skeleton v-if="isLoading" :count="6" />

						<template v-else>
							<div v-if="isLoadingMore" class="loading-more">
								<base-spinner />
							</div>

							<template v-for="item in groupedMessages" :key="item.id">
								<div v-if="item.type === 'date'" class="date-separator">
									<span>{{ formatDateLabel(item.content) }}</span>
								</div>

								<div v-else class="message-row" :class="{ me: item.data.is_sent }">
									<div class="message-wrapper">
										<div class="message-meta" v-if="!item.data.is_sent">
											<span class="msg-sender-name">{{ selectedConversation.name }}</span>
											<span class="msg-time">{{ formatTime(item.data.created_at) }}</span>
										</div>
										<div class="msg-bubble" :class="{ pending: item.data.pending }">
											<div class="msg-content">{{ item.data.content }}</div>
										</div>
										<div class="message-meta-me" v-if="item.data.is_sent">
											<span class="msg-time">{{ formatTime(item.data.created_at) }}</span>
										</div>
									</div>
								</div>
							</template>
						</template>
					</div>
				</div>

				<Transition name="fade-slide">
					<button v-if="showScrollButton" class="btn-scroll-bottom" @click="scrollToBottom">
						<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<polyline points="6 9 12 15 18 9"></polyline>
						</svg>
					</button>
				</Transition>
			</div>

			<!-- Input -->
			<div class="message-input-area">
				<div class="input-wrapper">
					<button class="btn-attach">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
							<circle cx="8.5" cy="8.5" r="1.5"></circle>
							<polyline points="21 15 16 10 5 21"></polyline>
						</svg>
					</button>
					<input type="text" v-model="newMessage" @keyup.enter="sendMessage" placeholder="Soạn tin nhắn..." />
					<button class="btn-send" @click="sendMessage" v-if="newMessage.trim()">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="12" y1="19" x2="12" y2="5"></line>
							<polyline points="5 12 12 5 19 12"></polyline>
						</svg>
					</button>
				</div>
			</div>
		</template>

		<div v-else class="empty-state">
			<div class="empty-content">
				<h3>Chọn một cuộc trò chuyện</h3>
				<p>Bắt đầu trò chuyện với gia sư hoặc học viên của bạn</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import MessageSkeleton from '~/components/message/MessageSkeleton.vue';
import { initSocket, getSocket } from '~/composables/useSocket';

const props = defineProps({
	selectedConversation: { type: Object, default: null },
	isMobile: { type: Boolean, default: false },
	showSidebar: { type: Boolean, default: false }
});

const emit = defineEmits(['back-to-sidebar', 'message-sent']);

const { api } = useApi();
const { getFirstCharacterOfLastName, formatTime } = useHelper();

// State
const newMessage = ref('');
const messages = ref([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const messageListRef = ref(null);
const showScrollButton = ref(false);
const pagination = ref({
	currentPage: 1,
	lastPage: 1,
	hasMore: false
});

// Computed
const groupedMessages = computed(() => {
	if (!messages.value?.length) return [];

	// Sort messages by date ASC
	const sortedMessages = [...messages.value].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

	const groups = [];
	let lastDate = null;

	sortedMessages.forEach(msg => {
		const date = new Date(msg.created_at).toDateString();
		if (date !== lastDate) {
			groups.push({ type: 'date', content: msg.created_at, id: `date-${date}` });
			lastDate = date;
		}
		groups.push({ type: 'message', data: msg, id: msg.id });
	});

	return groups;
});

const formatDateLabel = (data) => {
    const date = new Date(data);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Hôm qua';
    } else {
        return date.toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
};

// Scroll utilities
const scrollToBottom = (smooth = true) => {
	nextTick(() => {
		if (messageListRef.value) {
			messageListRef.value.scrollTo({
				top: messageListRef.value.scrollHeight,
				behavior: smooth ? 'smooth' : 'instant'
			});
		}
	});
};

const handleScroll = () => {

	if (!messageListRef.value) return;

	const { scrollTop, scrollHeight, clientHeight } = messageListRef.value;
	const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

	showScrollButton.value = distanceFromBottom > 20;

	console.log('Scroll top:', scrollTop);

	// Load more when scrolled to top
	if (scrollTop < 100 && pagination.value.hasMore && !isLoadingMore.value) {
		console.log('Loading more messages...');
		loadMoreMessages();
	}
};

// API calls
const fetchMessages = async (conversationId, page = 1) => {
	if (!conversationId) return;

	const isFirstLoad = page === 1;
	isFirstLoad ? (isLoading.value = true) : (isLoadingMore.value = true);

	if (isFirstLoad) messages.value = [];

	const previousHeight = messageListRef.value?.scrollHeight || 0;

	try {
		const response = await api.apiGet(`messages/${conversationId}?page=${page}`);

		if (response?.success) {
			const data = response.data || response;
			const paginationData = response.pagination;

			messages.value = isFirstLoad ? data : [...data, ...messages.value];

			pagination.value = {
				currentPage: paginationData.current_page || page,
				lastPage: paginationData.last_page || 1,
				hasMore: paginationData.has_more || false
			};

			console.log('Messages:', data);

			nextTick(() => {
				if (isFirstLoad) {
					scrollToBottom(false);
				} else if (messageListRef.value) {
					messageListRef.value.scrollTop = messageListRef.value.scrollHeight - previousHeight;
				}
			});
		}
	} catch (e) {
		console.error('Fetch messages error:', e);
	} finally {
		isLoading.value = false;
		isLoadingMore.value = false;
	}
};

const loadMoreMessages = () => {
	if (!props.selectedConversation) return;
	fetchMessages(props.selectedConversation.id, pagination.value.currentPage + 1);
};

const sendMessage = async () => {
	const content = newMessage.value.trim();
	if (!content || !props.selectedConversation || props.selectedConversation.type !== 'private') return;

	const receiverId = props.selectedConversation.other_user?.uid;
	if (!receiverId) return;

	newMessage.value = '';

	// Optimistic UI update
	const tempMessage = {
		id: `temp_${Date.now()}`,
		content,
		is_sent: true,
		created_at: new Date().toISOString(),
		pending: true
	};

	messages.value.push(tempMessage);
	scrollToBottom();

	try {
		const response = await api.apiPost('send-message', {
			receiver_id: receiverId,
			content,
			conversation_id: props.selectedConversation.id
		});

		if (response?.success) {
			const index = messages.value.findIndex(m => m.id === tempMessage.id);
			if (index !== -1) {
				messages.value[index] = { ...response.data, is_sent: true, pending: false };
			}
			emit('message-sent', { conversation_id: props.selectedConversation.id, message: response.data });
		} else {
			throw new Error(response?.message || 'Failed to send');
		}
	} catch (e) {
		console.error('Send message error:', e);
		messages.value = messages.value.filter(m => m.id !== tempMessage.id);
		newMessage.value = content;
	}
};

// Socket handlers
const handleMessageReceived = (e) => {
	if (!props.selectedConversation || !e.message) return;

	const isForThisConversation =
		e.conversation_id === props.selectedConversation.id ||
		(props.selectedConversation.type === 'private' &&
			[e.sender_id, e.receiver_id].includes(props.selectedConversation.other_user?.uid));

	if (!isForThisConversation) return;

	const exists = messages.value.some(m => m.id === e.message.id || (m.content === e.message.content && m.pending));

	if (!exists) {
		const isSentByMe = e.sender_id !== props.selectedConversation.other_user?.uid;
		messages.value.push({ ...e.message, is_sent: isSentByMe });
		scrollToBottom();
	} else {
		const index = messages.value.findIndex(m => m.content === e.message.content && m.pending);
		if (index !== -1) {
			messages.value[index] = { ...e.message, is_sent: true, pending: false };
		}
	}
};

const setupSocket = async () => {
	if (!process.client) return;

	try {
		let socket = getSocket();
		if (!socket?.connected) {
			await initSocket();
			socket = getSocket();
		}

		socket.emit('chat:join');
		socket.on('message.sent', handleMessageReceived);
	} catch (error) {
		console.error('Socket setup error:', error);
	}
};

// Lifecycle
watch(() => props.selectedConversation, (newConv) => {
	if (newConv) fetchMessages(newConv.id);
});

onMounted(setupSocket);

onUnmounted(() => {
	const socket = getSocket();
	if (socket) socket.off('message.sent', handleMessageReceived);
});
</script>

<style scoped>
@import url("~/assets/css/Message.css");

.msg-bubble.pending {
	opacity: 0.7;
}

.message-list-wrapper {
	flex: 1;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.btn-scroll-bottom {
	position: absolute;
	bottom: 16px;
	left: 50%;
	transform: translateX(-50%);
	width: 40px;
	height: 40px;
	border-radius: 50%;
	color: black;
	border: 1px solid #cbd5e1;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	z-index: 10;
	background: white;
}

.btn-scroll-bottom svg {
	animation: bounce 1.5s ease-in-out infinite;
}

.loading-more {
	display: flex;
	justify-content: center;
	padding: 1rem 0;
}

@keyframes bounce {

	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(3px);
	}
}

.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
	opacity: 0;
	transform: translateY(20px);
}
</style>