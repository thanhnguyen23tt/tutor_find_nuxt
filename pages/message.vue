<template>
	<base-loading v-if="isLoading" />

	<div class="chat-app">
		<!-- Sidebar -->
		<div class="sidebar" v-show="!isMobile || showSidebar">
			<div class="sidebar-header">
				<div class="sidebar-header_title">
					Tin nhắn
				</div>
				<div class="sidebar-header_action">
					<button class="btn-icon">
						<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<circle cx="11" cy="11" r="8"></circle>
							<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
						</svg>
					</button>
					<button class="btn-icon">
						<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="3"></circle>
							<path
								d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
							</path>
						</svg>
					</button>
				</div>
			</div>

			<div class="sidebar-navs">
				<button class="nav-pill" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">Tất
					cả</button>
				<button class="nav-pill" :class="{ active: activeTab === 'unread' }" @click="activeTab = 'unread'">Chưa
					đọc</button>
			</div>

			<div class="conversation-list">
				<div v-for="conv in filteredConversations" :key="conv.id"
					:class="['conversation-item', { selected: selectedConversation && selectedConversation.id === conv.id }]"
					@click="selectConversation(conv)">
					<div class="avatar-container">
						<template v-if="conv.type === 'private'">
							<img v-if="conv.avatar" :src="conv.avatar" class="avatar" />
							<div v-else class="avatar">
								{{ getFirstCharacterOfLastName(conv.name) }}
							</div>
							<div v-if="conv.is_online" class="online-indicator"></div>
						</template>
						<template v-else>
							<div class="avatar group-avatar">
								<svg class="icon-md" viewBox="0 0 24 24" fill="currentColor"
									xmlns="http://www.w3.org/2000/svg">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
									<circle cx="9" cy="7" r="4"></circle>
									<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
								</svg>
							</div>
						</template>
					</div>
					<div class="conv-info">
						<div class="conv-header">
							<span class="conv-name">{{ conv.name }}</span>
							<span class="conv-date">{{ conv.last_message ?
								formatRelativeTime(conv.last_message.created_at) : ''
							}}</span>
						</div>
						<div class="conv-preview">
							<span class="conv-last-msg">{{ conv.last_message?.content || 'Chưa có tin nhắn' }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Chat Main Area -->
		<div class="chat-main" v-show="!isMobile || !showSidebar">
			<template v-if="selectedConversation">
				<div class="chat-header">
					<div class="header-left">
						<button v-if="isMobile" class="btn-back" @click="backToSidebar">
							<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
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

				<div class="message-list">
					<div class="message-container">
						<template v-for="item in groupedMessages" :key="item.id">
							<!-- Date Separator -->
							<div v-if="item.type === 'date'" class="date-separator">
								<span>{{ formatTime(item.content) }}</span>
							</div>

							<!-- Message Bubble -->
							<div v-else class="message-row" :class="{ me: item.data.is_sent }">
								<div class="message-wrapper">
									<div class="message-meta" v-if="!item.data.is_sent">
										<span class="msg-sender-name">{{ selectedConversation.name }}</span>
										<span class="msg-time">{{ formatTime(item.data.created_at) }}</span>
									</div>
									<div class="msg-bubble">
										<div class="msg-content">{{ item.data.content }}</div>
									</div>
									<div class="message-meta-me" v-if="item.data.is_sent">
										<span class="msg-time">{{ formatTime(item.data.created_at) }}</span>
									</div>
								</div>
							</div>
						</template>
					</div>
				</div>

				<div class="message-input-area">
					<div class="input-wrapper">
						<button class="btn-attach">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
								<circle cx="8.5" cy="8.5" r="1.5"></circle>
								<polyline points="21 15 16 10 5 21"></polyline>
							</svg>
						</button>
						<input type="text" v-model="newMessage" @keyup.enter="sendMessage"
							placeholder="Soạn tin nhắn..." />
						<button class="btn-send" @click="sendMessage" v-if="newMessage.trim()">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round">
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
	</div>
</template>

<script setup>
definePageMeta({
	middleware: [
		'auth', 
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
})

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const { api } = useApi();
const { getFirstCharacterOfLastName, formatRelativeTime, formatTime } = useHelper();

const search = ref('');
const conversations = ref([]);
const selectedConversation = ref(null);
const newMessage = ref('');
const currentUserUid = ref(userStore.getUserData?.uid || '');
const isLoading = ref(false);

// Mobile sidebar/chat detail state
const showSidebar = ref(false);
const isMobile = ref(false);

// const = (dateString) => {
// 	const date = new Date(dateString);
// 	const today = new Date();
// 	const yesterday = new Date(today);
// 	yesterday.setDate(yesterday.getDate() - 1);

// 	if (date.toDateString() === today.toDateString()) {
// 		return 'Hôm nay';
// 	} else if (date.toDateString() === yesterday.toDateString()) {
// 		return 'Hôm qua';
// 	} else {
// 		// Format: Thứ Hai, 20/11
// 		const options = { weekday: 'long', day: 'numeric', month: 'numeric' };
// 		return date.toLocaleDateString('vi-VN', options);
// 	}
// };

const groupedMessages = computed(() => {
	if (!selectedConversation.value?.messages) return [];

	const groups = [];
	let lastDate = null;

	selectedConversation.value.messages.forEach(msg => {
		const date = new Date(msg.created_at).toDateString();
		if (date !== lastDate) {
			groups.push({ type: 'date', content: msg.created_at, id: `date-${date}` });
			lastDate = date;
		}
		groups.push({ type: 'message', data: msg, id: msg.id });
	});

	return groups;
});

function handleResize() {
	if (process.client) {
		isMobile.value = window.innerWidth <= 1024;
		if (isMobile.value) {
			// Nếu đang ở mobile, mặc định chỉ hiện sidebar
			if (!showSidebar.value && !selectedConversation.value) {
				showSidebar.value = true;
			}
		} else {
			// Desktop: luôn hiện cả 2
			showSidebar.value = false;
		}
	}
}

const activeTab = ref('all'); // 'all' | 'unread'

const filteredConversations = computed(() => {
	let result = conversations.value;

	// Filter by tab
	if (activeTab.value === 'unread') {
		result = result.filter(c => c.unread_count > 0);
	}

	// Filter by search
	if (search.value) {
		result = result.filter(c => c.name.toLowerCase().includes(search.value.toLowerCase()));
	}

	return result;
});

function selectConversation(conv) {
	selectedConversation.value = conversations.value.find(c => c.id === conv.id);

	if (isMobile.value) {
		showSidebar.value = false;
	}
}

function backToSidebar() {
	selectedConversation.value = null;
	if (isMobile.value) {
		showSidebar.value = true;
	}
}

const sendMessage = async () => {
	if (!newMessage.value.trim() || !selectedConversation.value) return;

	// Chỉ private chat mới có receiver_id
	if (selectedConversation.value.type !== 'private') {
		return;
	}

	try {
		// Gửi tin nhắn qua API
		const response = await api.apiPost('send-message', {
			receiver_id: selectedConversation.value.other_user.uid,
			content: newMessage.value,
		});
		const msg = response.message;

		const conv = conversations.value.find(c => c.id === selectedConversation.value.id);
		if (conv) {
			conv.messages.push({
				...msg,
				is_sent: true,
			});
			conv.last_message = msg;
		}

		newMessage.value = '';
	} catch (e) {
		console.error('Send message error:', e);
	}
};

const listenForMessages = () => {
	if (!process.client) return;

	const channelName = `chat.${currentUserUid.value}`;

	if (window.Echo) {
		window.Echo.private(channelName)
			.listen('.message.sent', (e) => {
				// Tìm conversation theo conversation_id hoặc sender_id (cho private chat)
				const updateConversations = conversations.value.find(c => {
					// Nếu có conversation_id trong event, dùng nó
					if (e.conversation_id) {
						return c.id === e.conversation_id;
					}
					// Fallback: tìm theo sender_id cho private chat
					return c.type === 'private' && c.other_user?.uid === e.sender_id;
				});

				if (updateConversations) {
					updateConversations.messages.push({
						...e.message,
						is_sent: false,
					});

					// Update last message
					if (e.last_message) {
						updateConversations.last_message = e.last_message;
					}
				}
			});
	}
};

const listenForPresence = () => {
	if (!process.client) return;

	if (window.Echo) {
		window.Echo.join('chat.presence')
			.here((users) => {
				updateOnlineStatus(users);
			})
			.joining((user) => {
				console.log('User joined:', user);
				updateUserOnlineStatus(user.id, true);
			})
			.leaving((user) => {
				console.log('User left:', user);
				updateUserOnlineStatus(user.id, false);
			});
	}
};

const updateOnlineStatus = (users) => {
	// Update online status for all users in the channel
	users.forEach(user => {
		updateUserOnlineStatus(user.id, true);
	});
};

const updateUserOnlineStatus = (userId, is_online) => {
	// Update the selected conversation's online status (only for private chat)
	if (selectedConversation.value &&
		selectedConversation.value.type === 'private' &&
		selectedConversation.value.other_user?.uid == userId) {
		selectedConversation.value.is_online = is_online;
	}

	// Update conversation list online status (only for private chat)
	const conversation = conversations.value.find(c =>
		c.type === 'private' && c.other_user?.uid == userId
	);
	if (conversation) {
		conversation.is_online = is_online;
	}
};

const getAllContactedUsers = async () => {
	isLoading.value = true;
	try {
		const response = await api.apiGet('contacted-users');
		conversations.value = (response.data || []).map(conv => {
			// Xử lý theo type của conversation
			if (conv.type === 'private') {
				return {
					...conv,
					name: conv.other_user?.full_name,
					avatar: conv.other_user?.avatar,
					archived: false,
				};
			} else if (conv.type === 'group') {
				return {
					...conv,
					name: conv.name,
					avatar: null,
					archived: false,
				};
			}
			return conv;
		});

		if (conversations.value.length > 0) {
			selectConversation(conversations.value[0]);
		}
	} catch (e) {
		console.error('Get all contacted users error:', e);
	} finally {
		isLoading.value = false;
	}
};

onMounted(async () => {
	if (process.client) {
		// Initialize mobile state
		isMobile.value = window.innerWidth <= 1024;
		showSidebar.value = isMobile.value;

		// Add resize listener
		window.addEventListener('resize', handleResize);
	}

	await getAllContactedUsers();

	// Start listening for presence events
	listenForPresence();
	listenForMessages();

	notificationStore.setHiddenNotificationPreview(true);
});

onUnmounted(() => {
	if (process.client) {
		window.removeEventListener('resize', handleResize);
	}
	notificationStore.setHiddenNotificationPreview(false);
});
</script>

<style scoped>
@import url("~/assets/css/Message.css");
</style>
