<template>
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
				<!-- Loading skeletons -->
				<template v-if="isLoading">
					<conversation-item-skeleton v-for="i in 3" :key="`skeleton-${i}`" />
				</template>

				<!-- Actual conversations -->
				<div v-else v-for="conv in filteredConversations" :key="conv.id"
					:class="['conversation-item', { selected: selectedConversation && selectedConversation.id === conv.id }]"
					@click="selectConversation(conv)">
					<div class="avatar-container">
						<template v-if="conv.type === 'private'">
							<img v-if="conv.avatar" :src="conv.avatar" class="avatar" />
							<div v-else class="avatar">
								{{ getFirstCharacterOfLastName(conv.name) }}
							</div>
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
		<message-detail 
			:selected-conversation="selectedConversation"
			:is-mobile="isMobile"
			:show-sidebar="showSidebar"
			@back-to-sidebar="backToSidebar"
			@message-sent="handleMessageSent"
		/>
	</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import MessageDetail from '~/components/message/MessageDetail.vue';
import ConversationItemSkeleton from '~/components/message/ConversationItemSkeleton.vue';
import { initSocket, getSocket } from '~/composables/useSocket';

definePageMeta({
	middleware: [
		'auth', 
		() => {
			useLayoutStore().setHiddenFooter(true)
		}
	],
	layout: 'chat'
})

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const { api } = useApi();
const { getFirstCharacterOfLastName, formatRelativeTime, formatTime } = useHelper();

const search = ref('');
const conversations = ref([]);
const selectedConversation = ref(null);
const isLoading = ref(false);
const userData = ref(userStore.getUserData);

// Mobile sidebar/chat detail state
const showSidebar = ref(false);
const isMobile = ref(false);


function handleResize() {
	if (process.client) {
		isMobile.value = window.innerWidth <= 1024;
		if (isMobile.value) {
			if (!showSidebar.value && !selectedConversation.value) {
				showSidebar.value = true;
			}
		} else {
			showSidebar.value = false;
		}
	}
}

const activeTab = ref('all');

const filteredConversations = computed(() => {
	let result = conversations.value;

	if (activeTab.value === 'unread') {
		result = result.filter(c => c.unread_count > 0);
	}

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

// Handle message sent from ContactDetail component
const handleMessageSent = (data) => {
	const conv = conversations.value.find(c => c.id === data.conversation_id);
	if (conv) {
		conv.last_message = {
			content: data.message.content,
			created_at: data.message.created_at
		};
	}
};

// Handler for incoming messages (Socket.IO)
const handleMessageReceived = (e) => {
	console.log('Page: message.sent event received:', e);
	
	const conv = conversations.value.find(c => {
		if (e.conversation_id) {
			return c.id === e.conversation_id;
		}
		return c.type === 'private' && c.other_user?.uid === e.sender_id;
	});

	if (conv) {
		conv.last_message = {
			content: e.last_message || e.message?.content,
			created_at: new Date().toISOString()
		};
	}
};

const listenForConversationUpdates = async () => {
	if (!process.client) return;

	try {
		let socket = getSocket();
		if (!socket?.connected) {
			await initSocket();
			socket = getSocket();
		}

		// Join chat room
		socket.emit('chat:join');

		// Listen for incoming messages via Socket.IO
		socket.on('message.sent', handleMessageReceived);

		console.log('✅ Listening for conversation updates via Socket.IO');
	} catch (error) {
		console.error('Failed to setup Socket.IO listeners:', error);
	}
};

const getAllContactedUsers = async () => {
	isLoading.value = true;
	try {
		const response = await api.apiGet('contacted-users');
		conversations.value = (response.data || []).map(conv => {
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
	} catch (e) {
		console.error('Get all contacted users error:', e);
	} finally {
		isLoading.value = false;
	}
};

onMounted(async () => {
	if (process.client) {
		isMobile.value = window.innerWidth <= 1024;
		showSidebar.value = isMobile.value;
		window.addEventListener('resize', handleResize);
	}

	await getAllContactedUsers();
	await listenForConversationUpdates();

	notificationStore.setHiddenNotificationPreview(true);
});

onUnmounted(() => {
	if (process.client) {
		window.removeEventListener('resize', handleResize);
	}
	
	// Cleanup Socket.IO listeners
	const socket = getSocket();
	if (socket) {
		socket.off('message.sent', handleMessageReceived);
		socket.emit('chat:leave');
	}
	
	notificationStore.setHiddenNotificationPreview(false);
});
</script>

<style scoped>
@import url("~/assets/css/Message.css");
</style>
