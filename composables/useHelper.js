import moment from 'moment'
import 'moment/locale/vi';

export const useHelper = () => {
	const config = useRuntimeConfig();

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	// const formatTime = (time) => {
	// 	return new Date(time).toLocaleTimeString("vi-VN", {
	// 		hour: "2-digit",
	// 		minute: "2-digit",
	// 	});
	// };

	const formatTime = (date) => {
		return new Date(date).toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	};


	const formatDateTime = (dateTime) => {
		return new Date(dateTime).toLocaleString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDuration = (hours) => {
		const minutes = Math.round(hours * 60);
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;

		if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
		if (h > 0) return `${h} giờ`;
		return `${m} phút`;
	};

	const formatDurationToMinutes = (hours) => {
		const minutes = Math.round(hours * 60);
		return minutes;
	};

	const diffDateTimeText = (dateTime1, dateTime2) => {
		moment.locale('vi');

		const m1 = moment(dateTime1).locale('vi');
		const m2 = moment(dateTime2).locale('vi');

		if (!m1.isValid() || !m2.isValid()) return '';

		const diffMs = Math.abs(m1.diff(m2)); // tính bằng milliseconds
		const duration = moment.duration(diffMs);

		// 👉 Trả về chuỗi thân thiện như "15 phút", "2 giờ", "1 ngày"
		return duration.humanize();
	};

	const showImage = (image) => {
		if (!image) return '';
		return config.public.apiUrl + image;
	};

	const getFirstCharacterOfLastName = (name) => {
		if (!name) return '';
		const words = name.trim().split(' ');
		const lastWord = words[words.length - 1];
		return lastWord.charAt(0).toUpperCase();
	};

	const formatRelativeTime = (dateTime) => {
		if (!dateTime) return '';

		const now = new Date();
		const targetDate = new Date(dateTime);
		const diffInMs = now - targetDate;

		const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
		const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30)); // Ước lượng 1 tháng = 30 ngày
		const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365)); // Ước lượng 1 năm = 365 ngày

		if (diffInMinutes < 1) {
			return 'Vừa xong';
		} else if (diffInMinutes < 60) {
			return `${diffInMinutes} phút trước`;
		} else if (diffInHours < 24) {
			return `${diffInHours} giờ trước`;
		} else if (diffInDays < 30) {
			return `${diffInDays} ngày trước`;
		} else if (diffInMonths < 12) {
			return `${diffInMonths} tháng trước`;
		} else {
			return `${diffInYears} năm trước`;
		}
	};

	const getTimeStatusClass = (timeInfo) => {
		if (!timeInfo) return '';

		if (timeInfo.is_before_start) {
			return 'time-status-waiting';
		} else if (timeInfo.is_after_end) {
			return 'time-status-ended';
		} else {
			return 'time-status-ready';
		}
	};

	const getTimeStatusMessage = (timeInfo) => {
		if (!timeInfo) return 'Không có thông tin thời gian';

		if (timeInfo.is_before_start) {
			const minutes = timeInfo.time_until_start_minutes;
			if (minutes > 1440) {
				const days = Math.floor(minutes / 1440);
				return `Lớp học chưa bắt đầu. Còn ${days} ngày để bắt đầu.`;
			} else if (minutes > 60) {
				const hours = Math.floor(minutes / 60);
				const remainingMinutes = minutes % 60;
				return `Lớp học chưa bắt đầu. Còn ${hours}h ${remainingMinutes} phút để bắt đầu.`;
			} else {
				return `Lớp học chưa bắt đầu. Còn ${minutes} phút để bắt đầu.`;
			}
		} else if (timeInfo.is_after_end) {
			return 'Lớp học đã kết thúc.';
		} else {
			return 'Lớp học chưa được phép bắt đầu.';
		}
	};

	const getParticipantsClass = (classroom) => {
		const current = classroom.participants_count || 0;
		const max = classroom.max_participants || 2;
		return current >= max ? 'participants-full' : 'participants-available';
	};

	const getStatusClass = (status) => {
		const statusClasses = {
			'pending': 'status-pending',
			'scheduled': 'status-scheduled',
			'started': 'status-started',
			'ended': 'status-ended',
			'cancelled': 'status-cancelled',
			'error': 'status-error'
		};
		return statusClasses[status] || '';
	};

	const compareTime = (a, b) => {
		return (!a || !b ? 0 : a.localeCompare(b))
	};

	const getDayOfWeek = (date) => {
		if (!date) return null
		const day = moment(date).day()
		console.log(day)
		return day;
	};

	const dataIsNull = (value) => {
		return !value || (Array.isArray(value) && value.length === 0)
			? 'Chưa có dữ liệu'
			: value
	};

	const calcDurationHours = (start, end) => {
		const s = moment(start, 'HH:mm')
		const e = moment(end, 'HH:mm')
		if (!s.isValid() || !e.isValid() || e.isBefore(s)) return 0
		return moment.duration(e.diff(s)).asHours()
	};

	const handleTimeSlot = (timeSlots, selectedDate = null) => {
		if (!timeSlots || !Array.isArray(timeSlots)) return []

		const now = new Date()
		const currentTime = moment(now).format('HH:mm')
		const currentDate = moment(now).format('YYYY-MM-DD')

		return timeSlots.map(slot => {
			let isDisabled = false

			// Mặc định disable tất cả các giờ đã qua
			if (slot.time) {
				const slotTime = moment(slot.time, 'HH:mm').format('HH:mm')

				// Nếu không có ngày được chọn hoặc ngày chọn là ngày hiện tại
				if (!selectedDate || selectedDate === currentDate) {
					isDisabled = slotTime <= currentTime
				}
				// Nếu ngày chọn là ngày trong quá khứ, disable tất cả
				else if (selectedDate < currentDate) {
					isDisabled = true
				}
			}

			return {
				...slot,
				disabled: isDisabled
			}
		})
	};

	const normalizeIcon = (icon) => {
		if (!icon) return []

		// Nếu là chuỗi → chỉ 1 path
		if (typeof icon === 'string') {
			return [{ type: 'path', d: icon }]
		}

		// Nếu là mảng → phân tích từng phần
		return icon.map((d) => {
			if (d.startsWith('M')) {
				// dạng path
				return { type: 'path', d }
			} else if (d.startsWith('M') === false && d.match(/[xy][12]=/)) {
				// dạng line (nếu bạn lưu kiểu `x1="12" y1="8" x2="12" y2="12"`)
				const attrs = Object.fromEntries(
					[...d.matchAll(/([a-z0-9]+)="([^"]+)"/g)].map(([_, k, v]) => [k, v])
				)
				return { type: 'line', ...attrs }
			} else {
				// fallback: coi là path
				return { type: 'path', d }
			}
		})
	};

	const createSlug = (text) => {
		if (!text) return '';
		return text
			.toLowerCase()
			.trim()
			.normalize('NFD') // Xử lý tiếng Việt có dấu
			.replace(/[\u0300-\u036f]/g, '') // Xóa dấu
			.replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
			.replace(/\s+/g, '-') // Thay khoảng trắng bằng -
			.replace(/-+/g, '-') // Xóa dấu - thừa
			.replace(/^-|-$/g, ''); // Xóa - đầu/cuối
	};

	return {
		formatCurrency,
		formatDate,
		formatTime,
		formatDateTime,
		formatDuration,
		formatDurationToMinutes,
		diffDateTimeText,
		getFirstCharacterOfLastName,
		formatRelativeTime,
		getTimeStatusClass,
		getTimeStatusMessage,
		getParticipantsClass,
		getStatusClass,
		compareTime,
		getDayOfWeek,
		dataIsNull,
		calcDurationHours,
		handleTimeSlot,
		normalizeIcon,
		createSlug,
		showImage,
	};
};

