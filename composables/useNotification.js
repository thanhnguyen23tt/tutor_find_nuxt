export const useNotification = () => {
	const notificationStore = useNotificationStore();

	let notificationId = 0;

	const notification = (data) => {
		const id = ++notificationId;
		const notificationData = {
			id,
			show: true,
			message: data.message,
			type: data.type,
		};

		// Add notification to queue
		notificationStore.addNotificationToQueue(notificationData);

		// Auto remove after time
		if (process.client) {
			setTimeout(() => {
				notificationStore.removeNotificationFromQueue(id);
			}, data.time);
		}
	};

	const error = (message) => {
		const data = {
			message: message,
			type: 'error',
			time: 5000,
		}
		notification(data);
	};

	const success = (message) => {
		const data = {
			message: message,
			type: 'success',
			time: 3000,
		}
		notification(data);
	};

	const info = (message) => {
		const data = {
			message: message,
			type: 'info',
			time: 3000,
		}
		notification(data);
	};

	const warning = (message) => {
		const data = {
			message: message,
			type: 'warning',
			time: 4000,
		}
		notification(data);
	};

	const warring = (message) => {
		// Keep old method for backward compatibility
		warning(message);
	};

	const errorNotEmpty = (message) => {
		const data = {
			message: message ?? "Không được để trống, vui lòng nhập dữ liệu",
			type: 'error',
			time: 5000,
		}
		notification(data);
	};

	return {
		notification,
		error,
		success,
		info,
		warning,
		warring,
		errorNotEmpty,
	};
};

