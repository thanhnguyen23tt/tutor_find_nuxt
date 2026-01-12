export const useConfig = () => {
	// Import config từ file config
	const configStore = useConfigStore();

	return {
		...configStore.configuration,
		// Các constants từ config/index.js
		order_benefits: [
			"Thanh toán an toàn và bảo mật",
			"Đảm bảo hoàn tiền nếu hủy lịch học, hoặc không hài lòng",
			"Hỗ trợ 24/7 từ đội ngũ TutorFind"
		],
		gender_options: [
			{ id: 1, name: 'Nam' },
			{ id: 2, name: 'Nữ' }
		],
		booking_complaint_status: {
			pending: 'pending',
			resolved: 'resolved',
			rejected: 'rejected',
			under_review: 'under_review'
		},
		experiences: [
			{ id: '', name: 'Tất cả' },
			{ id: 'new', name: 'Mới (0-2 năm)' },
			{ id: 'experienced', name: 'Kinh nghiệm (3-5 năm)' },
			{ id: 'expert', name: 'Chuyên gia (5+ năm)' }
		],
		status_booking: {
			waiting_payment: 'waiting_payment',
			pending: 'pending',
			confirmed: 'confirmed',
			completed: 'completed',
			cancelled: 'cancelled',
			rejected: 'rejected',
			request_rescheduled: 'request_rescheduled',
			both_missed: 'both_missed',
			confirme_completed: 'confirme_completed'
		},
		status_classroom: {
			waiting: 'waiting',
			pending: 'pending',
			confirmed: 'confirmed',
			completed: 'completed',
			cancelled: 'cancelled',
			started: 'started',
			ended: 'ended',
			both_missed: 'both_missed',
		},
		status_payment: {
			pending: 'pending',
			success: 'success',
			failed: 'failed',
			refunded: 'refunded',
			non_payment: 'non_payment'
		},
		status_booking_log: {
			pending: 'pending',
			confirmed: 'confirmed',
			completed: 'completed',
			cancelled: 'cancelled',
			rejected: 'rejected',
			request_rescheduled: 'request_rescheduled',
			both_missed: 'both_missed'
		},
		notification_type: {
			schedule: 'schedule',
			message: 'message',
			review: 'review',
			profile: 'profile',
			payment: 'payment',
			warning: 'warning'
		},
		notification_type_label: {
			schedule: 'Lịch học',
			message: 'Tin nhắn',
			review: 'Đánh giá',
			profile: 'Hồ sơ',
			payment: 'Thanh toán',
			warning: 'Cảnh báo'
		},
		notification_type_icons: {
			schedule: {
				viewBox: "0 0 24 24",
				path: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
			},
			message: {
				viewBox: "0 0 24 24",
				path: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
			},
			review: {
				viewBox: "0 0 24 24",
				path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
			},
			profile: {
				viewBox: "0 0 24 24",
				path: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
			},
			payment: {
				viewBox: "0 0 24 24",
				path: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z"
			},
			warning: {
				viewBox: "0 0 24 24",
				path: "M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
			}
		},
		next_steps: [
			{
				name: 'Chờ gia sư xác nhận',
				desc: 'Gia sư sẽ phản hồi trong vòng 24 giờ'
			},
			{
				name: 'Nhận thông báo',
				desc: 'Bạn sẽ nhận được email và SMS thông báo'
			},
			{
				name: 'Bắt đầu học',
				desc: 'Chuẩn bị tài liệu và bắt đầu buổi học'
			}
		],
		step_booking: [
			{
				id: 1,
				name: 'Thông tin buổi học',
				desc: 'Chọn thời gian, môn học và gia sư',
				component: 'LessonInformation'
			},
			{
				id: 2,
				name: 'Xác nhận đặt lịch',
				desc: 'Xác nhận đặt lịch và thanh toán',
				component: 'ConfirmBookingNew'
			},
			{
				id: 3,
				name: 'Thanh toán',
				desc: 'Thanh toán cho buổi học',
				component: 'BookingPay'
			}
		],
		help_action: {
			student: 'student',
			tutor: 'tutor'
		},
	};
};

