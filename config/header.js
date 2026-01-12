// constants/headerConfig.js

export const navigationLinks = [
	{
		id: 1,
		name: 'Trang chủ',
		path: '/',
		href: '#',
		priority: 10
	},
	{
		id: 2,
		name: 'Tìm gia sư',
		path: '/search',
		href: '#',
		priority: 11
	},
	{
		id: 3,
		name: 'Trở thành gia sư',
		path: '/become-tutor',
		href: '#',
		priority: 12
	},
];

export const userMenuItems = [
	{
		id: 2,
		name: 'Xem hồ sơ gia sư',
		path: '/profile/detail?tab=overview',
		icon: [
			'M16 7a4 4 0 11-8 0 4 4 0 018 0z',
			'M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
		],
		iconViewBox: '0 0 24 24',
		requiresAuth: true,
		is_tutor: true,
		priority: 23
	},
	{
		id: 3,
		name: 'Doanh thu',
		path: '/profile/revenue',
		icon: [
			'M12 2v20m0-20a9 9 0 0 1 9 9m-9-9a9 9 0 0 0-9 9m9 11a9 9 0 0 1-9-9m9 9a9 9 0 0 0 9-9M9 8h6M9 12h3M9 16h6'
		],
		iconViewBox: '0 0 24 24',
		requiresAuth: true,
		is_tutor: true,
		priority: 24
	},
	{
		id: 4,
		name: 'Tin nhắn',
		path: '/message',
		icon: [
			'M8 18L10.29 20.29C10.514 20.5156 10.7804 20.6946 11.0739 20.8168C11.3674 20.9389 11.6821 21.0018 12 21.0018C12.3179 21.0018 12.6326 20.9389 12.9261 20.8168C13.2196 20.6946 13.486 20.5156 13.71 20.29L16 18H18C19.0609 18 20.0783 17.5786 20.8284 16.8285C21.5786 16.0783 22 15.0609 22 14V7C22 5.93913 21.5786 4.92178 20.8284 4.17163C20.0783 3.42149 19.0609 3 18 3H6C4.93913 3 3.92172 3.42149 3.17157 4.17163C2.42142 4.92178 2 5.93913 2 7V14C2 15.0609 2.42142 16.0783 3.17157 16.8285C3.92172 17.5786 4.93913 18 6 18H8Z'
		],
		iconViewBox: '0 0 24 24',
		strokeWidth: '1.656',
		requiresAuth: true,
		priority: 20
	},
	{
		id: 5,
		name: 'Cài đặt',
		path: '/setting',
		icon: [
			'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
			'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
		],
		iconViewBox: '0 0 24 24',
		requiresAuth: true,
		priority: 95
	},
	{
		id: 6,
		name: 'Đăng xuất',
		path: '#',
		icon: [
			'M17 16l4-4m0 0l-4-4m4 4H7',
			'm6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
		],
		iconViewBox: '0 0 24 24',
		action: 'logout',
		requiresAuth: true,
		priority: 100
	}
];

export const headerActionButtons = [
	{
		id: 'question',
		type: 'router-link',
		icon: [
			'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', // vòng tròn
			'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3',       // dấu hỏi
			'M12 17h.01'                                  // chấm hỏi
		],
		iconViewBox: '0 0 24 24',
		className: 'question-card user-info',
		tooltip: 'Trợ giúp',
		stroke: 'currentColor',
		strokeWidth: 2,
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		fill: 'none',
		path: '/help',
		requiresAuth: undefined,
		priority: 90
	},
	{
		id: 'saved',
		type: 'router-link',
		path: '/saved',
		icon: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
		iconViewBox: '0 0 24 24',
		className: 'user-liked-card user-info',
		tooltip: 'Đã lưu',
		requiresAuth: true,
		priority: 23
	},
	{
		id: 'notification',
		type: 'button',
		icon: 'M10.268 21a2 2 0 0 0 3.464 0M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
		iconViewBox: '0 0 24 24',
		strokeWidth: 2,
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		className: 'notification-button-card user-info',
		tooltip: 'Thông báo',
		showBadge: true,
		badgeKey: 'notifications',
		action: 'toggleNotifications',
		requiresAuth: true,
		priority: 15,
		path: '/notification'
	},
	{
		id: 'login',
		type: 'action',
		label: 'Đăng nhập',
		className: 'btn-sm btn-no-bg card-item border-r-2 header-cta',
		action: 'openLoginModal',
		requiresAuth: false,
		priority: 1
	},
	// {
	// 	id: 'register',
	// 	type: 'action',
	// 	label: 'Đăng ký',
	// 	className: 'btn-sm btn-primary card-item border-r-2 header-cta',
	// 	action: 'openRegisterModal',
	// 	requiresAuth: false,
	// },
];

export const convertRangeToTimeSlots = (ranges) => {
    if (!ranges || !ranges.length) return [];
    
    const slots = [];
    const seen = new Set();
    const STEP = 60; // 1 hour step

    const toMinutes = (str) => {
        if (!str) return 0;
        const [h, m] = str.split(':').map(Number);
        return h * 60 + (m || 0);
    };

    const toTimeStr = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    
    ranges.forEach(range => {
        const startMins = toMinutes(range.start_time);
        const endMins = toMinutes(range.end_time);
        
        // Generate slots
        for (let time = startMins; time < endMins; time += STEP) {
            const timeStr = toTimeStr(time);
            const fullTime = timeStr; // Keep HH:mm format without :00
            
            if (!seen.has(fullTime)) {
                slots.push({
                    id: fullTime,
                    time: fullTime,
                    name: timeStr,
                    source_id: range.id
                });
                seen.add(fullTime);
            }
        }
    });
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
};
