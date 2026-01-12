import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Setup global Pusher for Echo
if (typeof window !== 'undefined') {
	window.Pusher = Pusher;
}

/**
 * Composable to manage Reverb (Laravel Echo) connection for Classroom
 * This runs in parallel with the existing WebSocket (Ratchet) implementation for comparison
 * 
 * @param {Object} options Configuration options
 * @param {boolean} options.autoConnect - Auto connect on mount
 * @param {boolean} options.debug - Enable debug logging
 */
export const useReverb = (options = {}) => {
	const {
		autoConnect = false,
		debug = true
	} = options;

	// ===== State =====
	const echoInstance = ref(null);
	const isConnected = ref(false);
	const connectionError = ref(null);
	
	// Store active channel subscriptions
	const channels = new Map();

	// Classroom-specific state (mirrors ClassRoom.vue state for comparison)
	const reverbState = reactive({
		participantsCount: 0,
		onlineUsers: [], // Users currently in the classroom (from presence channel)
		lastEvent: null, // Last received event for debugging
		classroomStatus: null,
		isClassroomStarted: false,
		isClassroomEnded: false,
	});

	// Event callbacks that can be set by the component
	const eventCallbacks = reactive({
		onParticipantJoined: null,
		onParticipantLeft: null,
		onParticipantUpdated: null,
		onSignal: null,
		onClassroomStarted: null,
		onClassroomEnded: null,
		onPresenceHere: null,
		onPresenceJoining: null,
		onPresenceLeaving: null,
		onError: null,
	});

	/**
	 * Debug logger
	 */
	const log = (...args) => {
		if (debug) {
			console.log('[Reverb]', ...args);
		}
	};

	/**
	 * Initialize Echo instance with Reverb configuration
	 */
	const connect = () => {
		if (typeof window === 'undefined' || !process.client) return;
		
		try {
			if (echoInstance.value) {
				log('Already connected');
				return;
			}

			log('Connecting to Reverb...');

			// Configuration for Laravel Reverb
			// These values should match your .env configuration
			echoInstance.value = new Echo({
				broadcaster: 'reverb',
				key: import.meta.env.VITE_REVERB_APP_KEY || import.meta.env.VITE_PUSHER_APP_KEY || 'local-app-key',
				wsHost: import.meta.env.VITE_REVERB_HOST || import.meta.env.VITE_PUSHER_HOST || '127.0.0.1',
				wsPort: import.meta.env.VITE_REVERB_PORT || import.meta.env.VITE_PUSHER_PORT || 8080,
				wssPort: import.meta.env.VITE_REVERB_PORT || import.meta.env.VITE_PUSHER_PORT || 8080,
				forceTLS: (import.meta.env.VITE_REVERB_SCHEME || import.meta.env.VITE_PUSHER_SCHEME || 'http') === 'https',
				enabledTransports: ['ws', 'wss'],
				disableStats: true,
				// Auth endpoint for presence channels
				authEndpoint: '/broadcasting/auth',
			});

			// Bind connection status events
			const pusher = echoInstance.value.connector.pusher;
			
			pusher.connection.bind('connected', () => {
				log('Connected successfully');
				isConnected.value = true;
				connectionError.value = null;
			});
			
			pusher.connection.bind('disconnected', () => {
				log('Disconnected');
				isConnected.value = false;
			});

			pusher.connection.bind('error', (error) => {
				log('Connection error:', error);
				connectionError.value = error;
				if (eventCallbacks.onError) {
					eventCallbacks.onError(error);
				}
			});

			pusher.connection.bind('state_change', (states) => {
				log('State changed:', states.previous, '->', states.current);
			});

		} catch (error) {
			console.error('[Reverb] Connection error:', error);
			connectionError.value = error;
		}
	};

	/**
	 * Join a classroom presence channel and set up all event listeners
	 * This mirrors the functionality from ClassRoomWebSocket.php and ClassRoomReverb.php
	 * 
	 * @param {number|string} classroomId - The classroom ID to join
	 * @param {Object} userData - Current user data { uid, name }
	 * @returns {Object} The channel instance
	 */
	const joinClassroom = (classroomId, userData = {}) => {
		if (!echoInstance.value) {
			connect();
		}

		const channelName = `classroom.${classroomId}`;
		log(`Joining classroom channel: ${channelName}`);
		
		// Leave existing channel if any
		if (channels.has(channelName)) {
			leaveChannel(channelName);
		}

		const channel = echoInstance.value.join(channelName);
		channels.set(channelName, channel);

		// ===== Presence Channel Events =====
		// These are built-in Reverb/Pusher presence channel events
		
		channel
			.here((users) => {
				// Called when first joining with list of all current users
				log('Presence - Users here:', users);
				reverbState.onlineUsers = users;
				reverbState.participantsCount = users.length;
				reverbState.lastEvent = { type: 'here', users, timestamp: Date.now() };

				if (eventCallbacks.onPresenceHere) {
					eventCallbacks.onPresenceHere(users);
				}
			})
			.joining((user) => {
				// Called when a new user joins (after you've joined)
				log('Presence - User joining:', user);
				
				// Add to online users if not already present
				if (!reverbState.onlineUsers.find(u => u.id === user.id)) {
					reverbState.onlineUsers.push(user);
				}
				reverbState.participantsCount = reverbState.onlineUsers.length;
				reverbState.lastEvent = { type: 'joining', user, timestamp: Date.now() };

				if (eventCallbacks.onPresenceJoining) {
					eventCallbacks.onPresenceJoining(user);
				}

				// Also trigger as participant_updated for compatibility with existing logic
				if (eventCallbacks.onParticipantJoined) {
					eventCallbacks.onParticipantJoined({
						user_uid: user.id,
						user_name: user.name,
						count: reverbState.participantsCount,
						action: 'joined'
					});
				}
			})
			.leaving((user) => {
				// Called when a user leaves
				log('Presence - User leaving:', user);
				
				// Remove from online users
				reverbState.onlineUsers = reverbState.onlineUsers.filter(u => u.id !== user.id);
				reverbState.participantsCount = reverbState.onlineUsers.length;
				reverbState.lastEvent = { type: 'leaving', user, timestamp: Date.now() };

				if (eventCallbacks.onPresenceLeaving) {
					eventCallbacks.onPresenceLeaving(user);
				}

				// Also trigger as participant_updated for compatibility
				if (eventCallbacks.onParticipantLeft) {
					eventCallbacks.onParticipantLeft({
						user_uid: user.id,
						user_name: user.name,
						count: reverbState.participantsCount,
						action: 'left'
					});
				}
			})
			.error((error) => {
				console.error('[Reverb] Channel error:', error);
				if (eventCallbacks.onError) {
					eventCallbacks.onError(error);
				}
			});

		// ===== Custom Broadcast Events =====
		// These match the events dispatched from ClassRoomReverb.php
		// Event names match broadcastAs() return values, prefixed with '.'

		// ParticipantUpdated event (from ParticipantUpdated.php)
		channel.listen('.participant_updated', (event) => {
			log('Event - participant_updated:', event);
			reverbState.participantsCount = event.count;
			reverbState.lastEvent = { type: 'participant_updated', event, timestamp: Date.now() };

			if (eventCallbacks.onParticipantUpdated) {
				eventCallbacks.onParticipantUpdated({
					classroom_id: event.classroomId,
					count: event.count,
					user_uid: event.userUid,
					user_name: event.userName,
					action: event.action
				});
			}

			// Also trigger specific callbacks
			if (event.action === 'joined' && eventCallbacks.onParticipantJoined) {
				eventCallbacks.onParticipantJoined({
					classroom_id: event.classroomId,
					count: event.count,
					user_uid: event.userUid,
					user_name: event.userName,
					action: event.action
				});
			} else if (event.action === 'left' && eventCallbacks.onParticipantLeft) {
				eventCallbacks.onParticipantLeft({
					classroom_id: event.classroomId,
					count: event.count,
					user_uid: event.userUid,
					user_name: event.userName,
					action: event.action
				});
			}
		});

		// Signal event for WebRTC (from ClassRoomSignal.php)
		channel.listen('.signal', (event) => {
			log('Event - signal:', event);
			reverbState.lastEvent = { type: 'signal', event, timestamp: Date.now() };

			if (eventCallbacks.onSignal) {
				eventCallbacks.onSignal({
					classroom_id: event.classroomId,
					from_uid: event.fromUid,
					signal: event.signal,
					target_uid: event.targetUid
				});
			}
		});

		// Classroom started event (from ClassRoomStarted.php)
		channel.listen('.classroom_started', (event) => {
			log('Event - classroom_started:', event);
			reverbState.isClassroomStarted = true;
			reverbState.classroomStatus = event.status;
			reverbState.lastEvent = { type: 'classroom_started', event, timestamp: Date.now() };

			if (eventCallbacks.onClassroomStarted) {
				eventCallbacks.onClassroomStarted({
					classroom_id: event.classroomId,
					status: event.status,
					status_text: event.statusText,
					message: event.message
				});
			}
		});

		// Classroom ended event (from ClassRoomEnded.php)
		channel.listen('.classroom_ended', (event) => {
			log('Event - classroom_ended:', event);
			reverbState.isClassroomEnded = true;
			reverbState.classroomStatus = event.status;
			reverbState.lastEvent = { type: 'classroom_ended', event, timestamp: Date.now() };

			if (eventCallbacks.onClassroomEnded) {
				eventCallbacks.onClassroomEnded({
					classroom_id: event.classroomId,
					status: event.status,
					status_text: event.statusText,
					actual_duration: event.actualDuration,
					message: event.message
				});
			}
		});

		return channel;
	};

	/**
	 * Leave a specific channel
	 * @param {string} channelName 
	 */
	const leaveChannel = (channelName) => {
		if (echoInstance.value) {
			log(`Leaving channel: ${channelName}`);
			echoInstance.value.leave(channelName);
			channels.delete(channelName);
		}
	};

	/**
	 * Leave classroom channel specifically
	 * @param {number|string} classroomId 
	 */
	const leaveClassroom = (classroomId) => {
		leaveChannel(`classroom.${classroomId}`);
		
		// Reset state
		reverbState.onlineUsers = [];
		reverbState.participantsCount = 0;
	};

	/**
	 * Send a client event (whisper) - useful for WebRTC signaling
	 * Note: This requires Reverb to be configured to allow client events
	 * 
	 * @param {number|string} classroomId 
	 * @param {string} eventName 
	 * @param {Object} data 
	 */
	const whisper = (classroomId, eventName, data) => {
		const channelName = `classroom.${classroomId}`;
		const channel = channels.get(channelName);
		
		if (channel) {
			log(`Whisper ${eventName}:`, data);
			channel.whisper(eventName, data);
		} else {
			console.warn('[Reverb] Cannot whisper - not in channel:', channelName);
		}
	};

	/**
	 * Disconnect from Echo/Reverb entirely
	 */
	const disconnect = () => {
		if (echoInstance.value) {
			log('Disconnecting...');
			
			// Leave all channels
			channels.forEach((channel, name) => {
				echoInstance.value.leave(name);
			});
			channels.clear();

			echoInstance.value.disconnect();
			echoInstance.value = null;
			isConnected.value = false;
			
			// Reset state
			reverbState.onlineUsers = [];
			reverbState.participantsCount = 0;
			reverbState.lastEvent = null;
		}
	};

	/**
	 * Set event callback handlers
	 * @param {Object} callbacks Object with callback functions
	 */
	const setCallbacks = (callbacks) => {
		Object.keys(callbacks).forEach(key => {
			if (eventCallbacks.hasOwnProperty(key)) {
				eventCallbacks[key] = callbacks[key];
			}
		});
	};

	/**
	 * Get comparison data for debugging (compare with WebSocket)
	 */
	const getComparisonData = () => ({
		source: 'Reverb (Laravel Echo)',
		isConnected: isConnected.value,
		participantsCount: reverbState.participantsCount,
		onlineUsers: reverbState.onlineUsers,
		lastEvent: reverbState.lastEvent,
		classroomStatus: reverbState.classroomStatus,
	});

	// Auto connect if requested
	if (autoConnect) {
		connect();
	}

	// Cleanup on unmount
	onBeforeUnmount(() => {
		disconnect();
	});

	return {
		// Connection
		connect,
		disconnect,
		isConnected,
		connectionError,
		
		// Channel management
		joinClassroom,
		leaveClassroom,
		leaveChannel,
		whisper,
		
		// State
		reverbState,
		
		// Callbacks
		setCallbacks,
		eventCallbacks,
		
		// Debugging
		getComparisonData,
		
		// Raw instance (for advanced usage)
		echoInstance,
	};
};

/**
 * Helper to create a dual WebSocket comparison setup
 * Use this to run both WebSocket (Ratchet) and Reverb side by side
 */
export const useDualWebSocket = () => {
	const comparisonLog = ref([]);

	const logComparison = (source, eventType, data) => {
		comparisonLog.value.push({
			timestamp: Date.now(),
			source,
			eventType,
			data: JSON.stringify(data).substring(0, 200) // Truncate for display
		});

		// Keep only last 50 entries
		if (comparisonLog.value.length > 50) {
			comparisonLog.value.shift();
		}
	};

	const clearLog = () => {
		comparisonLog.value = [];
	};

	return {
		comparisonLog,
		logComparison,
		clearLog,
	};
};
