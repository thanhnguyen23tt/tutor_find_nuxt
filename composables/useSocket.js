import { io } from 'socket.io-client';
import { ref, onUnmounted } from 'vue';

// Socket instance singleton
let socket = null;
let connectionPromise = null;

// Reactive state
const isConnected = ref(false);
const connectionError = ref(null);

/**
 * Initialize Socket.IO connection
 * @param {Object} options
 * @param {string} options.url - Socket server URL
 * @param {string} options.token - Auth token
 * @param {boolean} options.autoConnect - Auto connect on init
 * @returns {Promise<Socket>}
 */
export function initSocket(options = {}) {
	// Return existing connection promise if connecting
	if (connectionPromise) {
		return connectionPromise;
	}

	// Return existing socket if already connected
	if (socket?.connected) {
		return Promise.resolve(socket);
	}

	const config = useRuntimeConfig();
	const authCookie = useAuthCookie();

	const url = options.url || config.public.realtimeUrl || 'http://localhost:3001';
	const token = options.token || authCookie.getToken();

	connectionPromise = new Promise((resolve, reject) => {
		socket = io(url, {
			auth: {
				token: token
			},
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 20000,
			autoConnect: options.autoConnect !== false
		});

		socket.on('connect', () => {
			console.log('✅ Socket.IO connected:', socket?.id);
			isConnected.value = true;
			connectionError.value = null;
			resolve(socket);
		});

		socket.on('disconnect', (reason) => {
			console.log('❌ Socket.IO disconnected:', reason);
			isConnected.value = false;
		});

		socket.on('connect_error', (error) => {
			console.error('Socket.IO connection error:', error.message);
			connectionError.value = error.message;
			isConnected.value = false;
			
			// Reject only on first connection attempt
			if (!socket?.connected) {
				reject(error);
			}
		});

		socket.on('error', (error) => {
			console.error('Socket.IO error:', error);
			connectionError.value = typeof error === 'string' ? error : error.message;
		});

		// Handle reconnection
		socket.io.on('reconnect', (attempt) => {
			console.log('🔄 Socket.IO reconnected after', attempt, 'attempts');
			isConnected.value = true;
			connectionError.value = null;
		});

		socket.io.on('reconnect_error', (error) => {
			console.error('Socket.IO reconnection error:', error);
		});

		// Timeout for initial connection
		setTimeout(() => {
			if (!socket?.connected) {
				reject(new Error('Socket connection timeout'));
			}
		}, 20000);
	});

	connectionPromise.finally(() => {
		connectionPromise = null;
	});

	return connectionPromise;
}

/**
 * Get socket instance
 * @returns {Socket|null}
 */
export function getSocket() {
	return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
	if (socket) {
		socket.disconnect();
		socket = null;
		isConnected.value = false;
	}
}

/**
 * Subscribe to a channel (matches Laravel channel naming)
 * @param {string} channel
 * @returns {Promise<void>}
 */
export function subscribe(channel) {
	return new Promise((resolve, reject) => {
		if (!socket?.connected) {
			reject(new Error('Socket not connected'));
			return;
		}

		socket.emit('subscribe', { channel });

		// Listen for subscription result
		const successHandler = (data) => {
			if (data.channel === channel) {
				socket?.off('subscription_succeeded', successHandler);
				socket?.off('subscription_error', errorHandler);
				resolve();
			}
		};

		const errorHandler = (data) => {
			if (data.channel === channel) {
				socket?.off('subscription_succeeded', successHandler);
				socket?.off('subscription_error', errorHandler);
				reject(new Error(data.message));
			}
		};

		socket.on('subscription_succeeded', successHandler);
		socket.on('subscription_error', errorHandler);

		// Timeout
		setTimeout(() => {
			socket?.off('subscription_succeeded', successHandler);
			socket?.off('subscription_error', errorHandler);
			resolve(); // Resolve anyway after timeout
		}, 5000);
	});
}

/**
 * Unsubscribe from a channel
 * @param {string} channel
 */
export function unsubscribe(channel) {
	if (socket?.connected) {
		socket.emit('unsubscribe', { channel });
	}
}

/**
 * Vue composable for Socket.IO
 */
export function useSocket() {
	const eventHandlers = new Map();

	/**
	 * Listen to an event
	 * @param {string} event
	 * @param {Function} handler
	 */
	const on = (event, handler) => {
		if (!eventHandlers.has(event)) {
			eventHandlers.set(event, new Set());
		}
		eventHandlers.get(event).add(handler);

		if (socket) {
			socket.on(event, handler);
		}
	};

	/**
	 * Remove event listener
	 * @param {string} event
	 * @param {Function} handler
	 */
	const off = (event, handler) => {
		if (handler) {
			eventHandlers.get(event)?.delete(handler);
			socket?.off(event, handler);
		} else {
			eventHandlers.delete(event);
			socket?.off(event);
		}
	};

	/**
	 * Emit an event
	 * @param {string} event
	 * @param {any} data
	 */
	const emit = (event, data) => {
		if (socket?.connected) {
			socket.emit(event, data);
		} else {
			console.warn('Socket not connected, cannot emit:', event);
		}
	};

	/**
	 * Join chat room
	 */
	const joinChat = () => {
		emit('chat:join');
	};

	/**
	 * Leave chat room
	 */
	const leaveChat = () => {
		emit('chat:leave');
	};

	/**
	 * Join classroom room
	 * @param {number|string} classroomId
	 */
	const joinClassroom = (classroomId) => {
		emit('classroom:join', { classroomId });
	};

	/**
	 * Leave classroom room
	 * @param {number|string} classroomId
	 */
	const leaveClassroom = (classroomId) => {
		emit('classroom:leave', { classroomId });
	};

	/**
	 * Join classroom manager channel
	 */
	const joinClassroomManager = () => {
		emit('classroom-manager:join');
	};

	/**
	 * Leave classroom manager channel
	 */
	const leaveClassroomManager = () => {
		emit('classroom-manager:leave');
	};

	/**
	 * Send typing indicator
	 * @param {string} receiverId
	 * @param {number} conversationId
	 */
	const sendTyping = (receiverId, conversationId) => {
		emit('chat:typing', { receiverId, conversationId });
	};

	/**
	 * Stop typing indicator
	 * @param {string} receiverId
	 * @param {number} conversationId
	 */
	const stopTyping = (receiverId, conversationId) => {
		emit('chat:stop_typing', { receiverId, conversationId });
	};

	/**
	 * Mark messages as read
	 * @param {number} conversationId
	 * @param {string} senderId
	 */
	const markRead = (conversationId, senderId) => {
		emit('chat:mark_read', { conversationId, senderId });
	};

	// Cleanup on unmount
	onUnmounted(() => {
		// Remove all event handlers registered by this component
		eventHandlers.forEach((handlers, event) => {
			handlers.forEach(handler => {
				socket?.off(event, handler);
			});
		});
		eventHandlers.clear();
	});

	return {
		// State
		isConnected,
		connectionError,
		socket: getSocket,

		// Connection methods
		init: initSocket,
		disconnect: disconnectSocket,

		// Channel methods
		subscribe,
		unsubscribe,

		// Event methods
		on,
		off,
		emit,

		// Helper methods
		joinChat,
		leaveChat,
		joinClassroom,
		leaveClassroom,
		joinClassroomManager,
		leaveClassroomManager,
		sendTyping,
		stopTyping,
		markRead
	};
}

export default useSocket;
