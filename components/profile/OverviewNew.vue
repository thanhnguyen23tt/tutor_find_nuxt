<template>

	<!-- About You Section -->
	<div class="section-card heading-card" @click="showProfileDescriptionModal = true" v-if="!isLoading">
		<div class="header-wrapper">
			<div class="header-left">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
						<path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
						<path d="M10 9H8"></path>
						<path d="M16 13H8"></path>
						<path d="M16 17H8"></path>
					</svg>
				</div>
				<div class="title-wrapper">
					<span class="title-main">Giới thiệu bản thân</span>
					<span class="sub-title">Thông tin này sẽ được đưa vào hồ sơ công khai của bạn</span>
				</div>
			</div>
		</div>
		<div class="section-content_preview section-card_detail">
			<span>{{ form.about_you ? form.about_you.substring(0, 100) + (form.about_you.length > 100 ? '...' : '') :
				'Vui lòng click vào để chỉnh sửa các thông tin' }}</span>
			<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
				fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
			</svg>
		</div>
	</div>

	<!-- Personal Info Section -->
	<div class="section-card infomation-user" v-if="!isLoading">
		<div class="header-wrapper">
			<div class="header-left">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
						<circle cx="12" cy="7" r="4"></circle>
					</svg>
				</div>
				<div class="title-wrapper">
					<span class="title-main">Thông Tin Cá Nhân</span>
					<span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
				</div>
			</div>
			<div class="header-right">
				<button class="btn-sm btn-secondary" @click="navigateTo('/setting')">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
					</svg>
					<span>Chỉnh sửa</span>
				</button>
			</div>
		</div>
		<div class="main-content">
			<div class="info-grid" v-if="userDataDetail.first_name || userDataDetail.last_name">
				<div class="info-item">
					<div class="info-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
							<circle cx="12" cy="7" r="4"></circle>
						</svg>
					</div>
					<div class="info-content">
						<span class="label">Họ và tên</span>
						<span class="value">{{ userDataDetail.first_name }} {{ userDataDetail.last_name }}</span>
					</div>
				</div>
				<div class="info-item">
					<div class="info-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
							<polyline points="22,6 12,13 2,6"></polyline>
						</svg>
					</div>
					<div class="info-content">
						<span class="label">Email</span>
						<span class="value">{{ userDataDetail.email }}</span>
					</div>
				</div>
			</div>
			<div class="add-new-item" @click="navigateTo('/setting')" v-else>
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
				</div>
				<span class="title">Cập nhật thông tin</span>
				<span class="sub-title">Hoàn thiện hồ sơ của bạn</span>
			</div>
		</div>
	</div>

	<!-- Identity Verification Section -->
	<div class="section-card identity-verification" v-if="!isLoading">
		<div class="header-wrapper">
			<div class="header-left">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<rect x="3" y="4" width="18" height="16" rx="2"></rect>
						<circle cx="9" cy="10" r="2"></circle>
						<line x1="15" y1="8" x2="17" y2="8"></line>
						<line x1="15" y1="12" x2="17" y2="12"></line>
						<line x1="7" y1="16" x2="17" y2="16"></line>
					</svg>
				</div>
				<div class="title-wrapper">
					<span class="title-main">Xác minh danh tính</span>
					<span class="sub-title">Xác minh để tăng độ tin cậy với học sinh</span>
				</div>
			</div>
			<div class="header-right">
				<button class="btn-sm btn-secondary" @click="showIdentityVerificationModal = true">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>{{ userDataDetail.identity_document_images?.length > 0 ? 'Cập nhật' : 'Thêm mới' }}</span>
				</button>
			</div>
		</div>
		<div class="main-content">
			<div class="identity-list" v-if="userDataDetail.identity_document_images?.length > 0">
				<div class="identity-card section-card_detail" v-for="doc in userDataDetail.identity_document_images" :key="doc.id"
					@click="showIdentityVerificationModal = true">
					<div class="identity-header">
						<div class="identity-left">
							<div class="icon-wrapper">
								<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
									fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
									stroke-linejoin="round">
									<rect x="3" y="4" width="18" height="16" rx="2"></rect>
									<circle cx="9" cy="10" r="2"></circle>
									<line x1="15" y1="8" x2="17" y2="8"></line>
									<line x1="15" y1="12" x2="17" y2="12"></line>
									<line x1="7" y1="16" x2="17" y2="16"></line>
								</svg>
							</div>
							<div class="identity-info">
								<span class="identity-name">{{ doc.identity_document_type?.name }}</span>
								<span class="identity-side">{{ doc.side_label }}</span>
							</div>
						</div>
					</div>
					<div class="identity-image" v-if="doc.image_url" style="margin-top: 12px;">
						<img :src="doc.image_url" alt="Document" style="height: 120px; width: auto; object-fit: contain; border-radius: 8px; border: 1px solid #eee;">
					</div>
				</div>
			</div>

			<div class="add-new-item" @click="showIdentityVerificationModal = true"
				v-if="!userDataDetail.identity_document_images || userDataDetail.identity_document_images.length == 0">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
				</div>
				<span class="title">Thêm giấy tờ xác minh</span>
				<span class="sub-title">Tăng độ tin cậy cho hồ sơ của bạn</span>
			</div>
		</div>
	</div>

	<!-- Video Intro Section -->
	<div class="section-card video-intro" v-if="!isLoading">
		<div class="header-wrapper">
			<div class="header-left">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
						<rect x="2" y="6" width="14" height="12" rx="2"></rect>
					</svg>
				</div>
				<div class="title-wrapper">
					<span class="title-main">Video Giới Thiệu</span>
					<span class="sub-title">Link video YouTube giới thiệu bản thân</span>
				</div>
			</div>
			<div class="header-right">
				<button class="btn-sm btn-secondary" @click="showVideoModal = true">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
					</svg>
					<span>{{ userDataDetail.referral_link ? 'Cập nhật' : 'Thêm mới' }}</span>
				</button>
			</div>
		</div>
		<div class="main-content">
			<div class="video-preview-container" v-if="userDataDetail.referral_link">
				<iframe :src="getEmbedUrl(userDataDetail.referral_link)" width="100%" height="315" frameborder="0"
					allowfullscreen style="border-radius: 12px;"></iframe>
			</div>
			<div class="add-new-item" @click="showVideoModal = true" v-else>
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
				</div>
				<span class="title">Thêm video giới thiệu</span>
				<span class="sub-title">Thu hút học viên bằng video</span>
			</div>
		</div>
	</div>

	<!-- education-section -->
	<div class="section-card education-section" v-if="!isLoading">
		<div class="header-wrapper">
			<div class="header-left">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path
							d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z">
						</path>
						<path d="M22 10v6"></path>
						<path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
					</svg>
				</div>
				<div class="title-wrapper">
					<span class="title-main">Học vấn</span>
					<span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
				</div>
			</div>
			<div class="header-right">
				<button class="btn-sm btn-secondary" @click="showAddEducationModal = true">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>Thêm mới</span>
				</button>
			</div>
		</div>
		<div class="main-content">
			<div class="education-list">
				<div class="education-card section-card_detail" v-for="edu in userDataDetail.user_educations" :key="edu.id"
					@click="showEditEducation(edu)">
					<div class="education-header">
						<div class="education-left">
							<div class="icon-wrapper">
								<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path
										d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z">
									</path>
									<path d="M22 10v6"></path>
									<path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
								</svg>
							</div>
							<div class="title-wrapper">
								<span class="title-main">{{ edu.school_name }}</span>
								<span class="sub-title">{{ edu.major }}</span>
							</div>
						</div>
						<div class="education-right actions-card">
							<button class="btn-no-bg" @click.stop="showEditEducation(edu)">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
									<path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
								</svg>
							</button>
							<button class="btn-no-bg" @click.stop="deleteEducation(edu.id)">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 6h18"></path>
									<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
									<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
									<line x1="10" x2="10" y1="11" y2="17"></line>
									<line x1="14" x2="14" y1="11" y2="17"></line>
								</svg>
							</button>
						</div>
					</div>
					<div class="desc">{{ edu.description }}</div>
					<div class="education-content">
						<div class="time">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round" class="icon-md">
								<path d="M8 2v4"></path>
								<path d="M16 2v4"></path>
								<rect width="18" height="18" x="3" y="4" rx="2"></rect>
								<path d="M3 10h18"></path>
							</svg>
							<span>{{ edu.time }}</span>
						</div>
						<div class="star">
							<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 2l3 6 6 1-4.5 4.5 1 6-5.5-3-5.5 3 1-6L2 9l6-1z"></path>
							</svg>
							<span>3.8/4.0</span>
						</div>
					</div>
				</div>
			</div>

			<div class="add-new-item" @click="showAddEducationModal = true"
				v-if="userDataDetail.user_educations?.length == 0">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
				</div>
				<span class="title">Thêm học vấn mới</span>
				<span class="sub-title">Mở rộng khả năng dạy của bạn</span>
			</div>
		</div>
	</div>
	<!-- End education -->

	<!-- experience-section -->
	<div class="section-card experience-section">
		<div class="header-wrapper">
			<div class="header-left">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
						<rect width="20" height="14" x="2" y="6" rx="2"></rect>
					</svg>
				</div>
				<div class="title-wrapper">
					<span class="title-main">Kinh nghiệm</span>
					<span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
				</div>
			</div>
			<div class="header-right">
				<button class="btn-sm btn-secondary" @click="showAddExperienceModal = true">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>Thêm mới</span>
				</button>
			</div>
		</div>
		<div class="main-content">
			<div class="experience-list">
				<div class="experience-card section-card_detail" v-for="exp in userDataDetail.user_experiences" :key="exp.id"
					@click="showEditExperience(exp)">
					<div class="experience-header">
						<div class="experience-left">
							<div class="icon-wrapper">
								<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
									<rect width="20" height="14" x="2" y="6" rx="2"></rect>
								</svg>
							</div>
							<div class="title-wrapper">
								<span class="title-main">{{ exp.name }}</span>
								<span class="sub-title">{{ exp.position }}</span>
							</div>
						</div>
						<div class="experience-right actions-card">
							<button class="btn-no-bg" @click.stop="showEditExperience(exp)">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
									<path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
								</svg>
							</button>
							<button class="btn-no-bg" @click.stop="deleteExperience(exp.id)">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 6h18"></path>
									<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
									<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
									<line x1="10" x2="10" y1="11" y2="17"></line>
									<line x1="14" x2="14" y1="11" y2="17"></line>
								</svg>
							</button>
						</div>
					</div>
					<div class="desc">{{ exp.description }}</div>
					<div class="experience-content">
						<div class="time">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round" class="icon-md">
								<path d="M8 2v4"></path>
								<path d="M16 2v4"></path>
								<rect width="18" height="18" x="3" y="4" rx="2"></rect>
								<path d="M3 10h18"></path>
							</svg>
							<span>{{ exp.time }}</span>
						</div>
						<!-- Có thể thêm các trường khác nếu có -->
					</div>
				</div>
			</div>

			<div class="add-new-item" @click="showAddExperienceModal = true"
				v-if="userDataDetail.user_experiences?.length == 0">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
				</div>
				<span class="title">Thêm kinh nghiệm mới</span>
				<span class="sub-title">Mở rộng khả năng dạy của bạn</span>
			</div>
		</div>
	</div>
	<!-- End experience -->

	<div class="section-card subject-section">
		<div class="header-wrapper">
			<div class="header-left">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
						<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
					</svg>
				</div>
				<div class="title-wrapper">
					<span class="title-main">Môn học giảng dạy</span>
					<span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
				</div>
			</div>
			<div class="header-right">
				<button class="btn-sm btn-secondary" @click="showCreateSubjectModal()">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>Thêm mới</span>
				</button>
			</div>
		</div>
		<div class="main-content">
			<div class="subject-list">
				<div class="subject-card section-card_detail" v-for="subject in userDataDetail.user_subjects" :key="subject.id"
					@click="showEditSubject(subject)">
					<div class="subject-header">
						<div class="subject-header_right">
							<span class="name">{{ subject.name }}</span>
							<span class="experience">{{ subject.years_of_experience }} năm kinh nghiệm</span>
						</div>
						<div class="actions actions-card">
							<button class="btn-no-bg" @click.stop="showEditSubject(subject)">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
									<path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
								</svg>
							</button>
							<button class="btn-no-bg" @click.stop="deleteSubject(subject.id)">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 6h18"></path>
									<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
									<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
									<line x1="10" x2="10" y1="11" y2="17"></line>
									<line x1="14" x2="14" y1="11" y2="17"></line>
								</svg>
							</button>
						</div>
					</div>
					<div class="level-wrapper">
						<div class="level">
							<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"></circle>
								<polyline points="12 6 12 12 16 14"></polyline>
							</svg>
							<span>{{ subject.level }}</span>
						</div>
						<div class="compare">
							<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round" style="color: rgb(249, 206, 105);">
								<polygon
									points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
								</polygon>
							</svg>
							<span>{{ subject.years_of_experience }}/10</span>
						</div>
					</div>
					<div class="ruler-wrapper">
						<div class="ruler-header">
							<span>Mức độ thành thạo</span>
							<span class="percent">{{ subject.progress }}%</span>
						</div>
						<div class="ruler-center">
							<div class="rounded-full">
								<div class="ruler" :style="{ width: subject.progress + '%' }"></div>
							</div>
							<div class="rounded" :style="{ left: `calc(${subject.progress}% - 6px)` }"></div>
						</div>
						<div class="ruler-footer">
							<span>Mới bắt đầu</span>
							<span>Thành thạo</span>
						</div>
					</div>
					<!-- <div class="information-detail-gird">
                    <div class="information-item">
                        <span>4</span>
                        <span>Đánh giá</span>
                    </div>
                    <div class="information-item">
                        <span>4</span>
                        <span>Năm kinh nghiệm</span>
                    </div>
                    <div class="information-item">
                        <span>4</span>
                        <span>Học sinh</span>
                    </div>
                </div> -->
				</div>
			</div>
			<div class="add-new-item" @click="showCreateSubjectModal = true"
				v-if="userDataDetail.user_subjects?.length == 0">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
				</div>
				<span class="title">Thêm môn học mới</span>
				<span class="sub-title">Mở rộng khả năng dạy của bạn</span>
			</div>
		</div>
	</div>
	<!-- End subject-taught -->

	<!-- language-section -->
	<div class="section-card language-section">
		<div class="header-wrapper">
			<div class="header-left">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
						<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
					</svg>
				</div>
				<div class="title-wrapper">
					<span class="title-main">Ngôn ngữ</span>
					<span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
				</div>
			</div>
			<div class="header-right">
				<button class="btn-sm btn-secondary" @click="showAddLanguageModal = true">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>Thêm mới</span>
				</button>
			</div>
		</div>
		<div class="main-content">
			<div class="language-list">
				<div class="language-card section-card_detail" v-for="lang in userDataDetail.user_languages" :key="lang.id"
					@click="handleEditLanguage(lang)">
					<div class="language-header">
						<div class="language-header_right">
							<span class="name">{{ lang.language }}</span>
							<span class="experience">{{ lang.is_native ? 'Ngôn ngữ mẹ đẻ' : lang.level }}</span>
						</div>
						<div class="actions actions-card">
							<button class="btn-no-bg" @click.stop="handleEditLanguage(lang)">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
									<path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
								</svg>
							</button>
							<button class="btn-no-bg" @click.stop="handleDeleteLanguage(lang.id)">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 6h18"></path>
									<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
									<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
									<line x1="10" x2="10" y1="11" y2="17"></line>
									<line x1="14" x2="14" y1="11" y2="17"></line>
								</svg>
							</button>
						</div>
					</div>
					<div class="level-wrapper">
						<div class="level">
							<svg class="icon-md" style="color: var(--color-primary)" xmlns="http://www.w3.org/2000/svg"
								width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
								stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path
									d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526">
								</path>
								<circle cx="12" cy="8" r="6"></circle>
							</svg>
							<span>{{ lang.level }}</span>
						</div>
						<div class="compare" v-if="lang.is_native">
							<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
							</svg>
							<span>Ngôn ngữ mẹ đẻ</span>
						</div>
					</div>
					<div class="ruler-wrapper">
						<div class="ruler-header">
							<span>Trình độ thành thạo</span>
							<span class="percent">{{ lang.percent ? lang.percent + '%' : '' }}</span>
						</div>
						<div class="ruler-center">
							<div class="rounded-full">
								<div class="ruler" :style="{ width: (lang.percent || 60) + '%' }"></div>
							</div>
							<div class="rounded" :style="{ left: `calc(${lang.percent || 60}% - 6px)` }"></div>
						</div>
						<div class="ruler-footer">
							<span>A1 (Cơ bản)</span>
							<span>C2 (Thành thạo)</span>
						</div>
					</div>
				</div>
			</div>

			<div class="add-new-item" @click="showAddLanguageModal()" v-if="userDataDetail.user_languages?.length == 0">
				<div class="icon-wrapper">
					<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
				</div>
				<span class="title">Thêm ngôn ngữ mới</span>
				<span class="sub-title">Mở rộng khả năng dạy của bạn</span>
			</div>
		</div>
	</div>

	<!-- Modal: Thêm học vấn -->
	<base-modal :is-open="showAddEducationModal" title="Thêm học vấn" description="Nơi bạn từng học hoặc đã học"
		size="medium" @close="showAddEducationModal = false">
		<div class="modal-content">
			<base-input v-model="newEducation.school_name" label="Tên trường/viện" placeholder="Nhập tên trường"
				:error="formErrors.school_name"></base-input>
			<base-input v-model="newEducation.major" label="Bằng cấp/Chuyên ngành" placeholder="Nhập ngành học"
				:error="formErrors.major"></base-input>
			<base-input v-model="newEducation.time" label="Thời gian" placeholder="VD: 2020-2024"
				:error="formErrors.time"></base-input>
			<base-input v-model="newEducation.description" label="Mô tả chi tiết" placeholder="Nhập mô tả"
				type="textarea" rows="4" :error="formErrors.description" />

			<div class="form-group file-group">
				<label class="file-label-top text-base">Ảnh bằng cấp *</label>
				<div class="up-file-wrapper">
					<div v-if="educationCertificatePreview" class="preview-image">
						<img :src="educationCertificatePreview" alt="Preview bằng cấp">
						<div class="actions-wrapper">
							<div class="actions">
								<button type="button" @click.prevent="triggerFile('educationCertificate')">
									<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round" stroke-linejoin="round">
										<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
										<path d="M3 3v5h5"></path>
									</svg>
								</button>
								<button type="button" @click.prevent="removeFile('certificate')">
									<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round" stroke-linejoin="round">
										<path d="M18 6 6 18"></path>
										<path d="m6 6 12 12"></path>
									</svg>
								</button>
							</div>
						</div>
					</div>
					<div v-else class="up-file">
						<div class="icon-wrapper" @click="triggerFile('educationCertificate')">
							<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="M5 12h14"></path>
								<path d="M12 5v14"></path>
							</svg>
						</div>
						<div class="content">
							<span class="title">Tải lên ảnh bằng cấp</span>
							<span class="sub-title">Kéo thả file hoặc <a href="#"
									@click.prevent="triggerFile('educationCertificate')">chọn file</a></span>
							<span class="desc">PNG, JPG tối đa 10MB</span>
						</div>
					</div>
					<input type="file" id="educationCertificate" accept="image/*"
						@change="onFileChange($event, 'certificate')" style="display:none;" />
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn-md btn-secondary" @click="showAddEducationModal = false">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
					<span>Hủy</span>
				</button>
				<button :class="['btn-md', 'btn-primary', { 'btn-loading': isAddingEducation }]" @click="addNewEducation" :disabled="!isValidAddEducationInput || isAddingEducation">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>{{ isAddingEducation ? 'Đang thêm...' : 'Thêm' }}</span>
				</button>
			</div>
		</div>
	</base-modal>

	<!-- Modal: Sửa học vấn -->
	<base-modal :is-open="showEditEducationModal" title="Chỉnh sửa học vấn" description="Nơi bạn từng học hoặc đã học"
		size="medium" @close="showEditEducationModal = false">
		<div class="modal-content">
			<base-input v-model="userDataAction.education.school_name" label="Tên trường/viện"
				placeholder="Nhập tên trường"></base-input>
			<base-input v-model="userDataAction.education.major" label="Bằng cấp/Chuyên ngành"
				placeholder="Nhập ngành học" :error="formErrors.major"></base-input>
			<base-input v-model="userDataAction.education.time" label="Thời gian" placeholder="VD: 2020-2024"
				:error="formErrors.time"></base-input>
			<base-input v-model="userDataAction.education.description" label="Mô tả chi tiết" placeholder="Nhập mô tả"
				type="textarea" rows="4" :error="formErrors.description"></base-input>

			<div class="form-group file-group">
				<label class="file-label-top text-base">Ảnh bằng cấp *</label>
				<div class="up-file-wrapper">
					<div v-if="editEducationCertificatePreview" class="preview-image">
						<img :src="showImage(editEducationCertificatePreview)" alt="Preview bằng cấp">
						<div class="actions-wrapper">
							<div class="actions">
								<button type="button" @click.prevent="triggerFile('editEducationCertificate')">
									<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round" stroke-linejoin="round">
										<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
										<path d="M3 3v5h5"></path>
									</svg>
								</button>
								<button type="button" @click.prevent="removeFile('edit_certificate')">
									<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round" stroke-linejoin="round">
										<path d="M18 6 6 18"></path>
										<path d="m6 6 12 12"></path>
									</svg>
								</button>
							</div>
						</div>
					</div>
					<div v-else class="up-file">
						<div class="icon-wrapper" @click="triggerFile('editEducationCertificate')">
							<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="M5 12h14"></path>
								<path d="M12 5v14"></path>
							</svg>
						</div>
						<div class="content">
							<span class="title">Tải lên ảnh bằng cấp</span>
							<span class="sub-title">Kéo thả file hoặc <a href="#"
									@click.prevent="triggerFile('editEducationCertificate')">chọn file</a></span>
							<span class="desc">PNG, JPG tối đa 10MB</span>
						</div>
					</div>
					<input type="file" id="editEducationCertificate" accept="image/*"
						@change="onFileChange($event, 'edit_certificate')" style="display:none;" />
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn-md btn-secondary" @click="showEditEducationModal = false">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
					<span>Hủy</span>
				</button>
				<button :class="['btn-md', 'btn-danger', { 'btn-loading': isDeletingEducation }]" @click="deleteEducation(userDataAction.education.id)" :disabled="isDeletingEducation">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 6h18"></path>
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
					</svg>
					<span>{{ isDeletingEducation ? 'Đang xóa...' : 'Xóa' }}</span>
				</button>
				<button :class="['btn-md', 'btn-primary', { 'btn-loading': isUpdatingEducation }]" @click="updateEducation" :disabled="!isValidEditEducationInput || isUpdatingEducation">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20,6 9,17 4,12"></polyline>
					</svg>
					<span>{{ isUpdatingEducation ? 'Đang lưu...' : 'Lưu thay đổi' }}</span>
				</button>
			</div>
		</div>
	</base-modal>

	<!-- Modal: Thêm kinh nghiệm -->
	<base-modal :is-open="showAddExperienceModal" title="Thêm kinh nghiệm"
		description="Kinh nghiệm là kinh nghiệm bạn có trong lĩnh vực dạy hoặc học" size="medium"
		@close="showAddExperienceModal = false">
		<div class="modal-content">
			<base-input v-model="newExperience.name" label="Tên tổ chức/trường học" placeholder="Nhập tên tổ chức"
				:error="formErrors.name"></base-input>
			<base-input v-model="newExperience.position" label="Vị trí công việc" placeholder="Nhập vị trí công việc"
				:error="formErrors.position"></base-input>
			<base-input v-model="newExperience.time" label="Thời gian" placeholder="VD: 2020-2024"
				:error="formErrors.time"></base-input>
			<base-input v-model="newExperience.description" label="Mô tả chi tiết" placeholder="Nhập mô tả"
				type="textarea" rows="4" :error="formErrors.description"></base-input>
			<div class="modal-footer">
				<button class="btn-md btn-secondary" @click="showAddExperienceModal = false">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
					<span>Hủy</span>
				</button>
				<button :class="['btn-md', 'btn-primary', { 'btn-loading': isAddingExperience }]" @click="addNewExperience" :disabled="!isValidAddExperienceInput || isAddingExperience">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>{{ isAddingExperience ? 'Đang thêm...' : 'Thêm' }}</span>
				</button>
			</div>
		</div>
	</base-modal>

	<!-- Modal: Sửa kinh nghiệm -->
	<base-modal :is-open="showEditExperienceModal" title="Chỉnh sửa kinh nghiệm"
		description="Kinh nghiệm là kinh nghiệm bạn có trong lĩnh vực dạy hoặc học" size="medium"
		@close="showEditExperienceModal = false">
		<div class="modal-content">
			<base-input v-model="userDataAction.experience.name" label="Tên trường/viện" placeholder="Nhập tên trường"
				:error="formErrors.name"></base-input>
			<base-input v-model="userDataAction.experience.position" label="Vị trí công việc"
				placeholder="Nhập vị trí công việc" :error="formErrors.position"></base-input>
			<base-input v-model="userDataAction.experience.time" label="Thời gian" placeholder="VD: 2020-2024"
				:error="formErrors.time"></base-input>
			<base-input v-model="userDataAction.experience.description" label="Mô tả chi tiết" placeholder="Nhập mô tả"
				type="textarea" rows="4" :error="formErrors.description"></base-input>
			<div class="modal-footer">
				<button class="btn-md btn-secondary" @click="showEditExperienceModal = false">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
					<span>Hủy</span>
				</button>
				<button :class="['btn-md', 'btn-danger', { 'btn-loading': isDeletingExperience }]" @click="deleteExperience(userDataAction.experience.id)" :disabled="isDeletingExperience">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 6h18"></path>
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
					</svg>
					<span>{{ isDeletingExperience ? 'Đang xóa...' : 'Xóa' }}</span>
				</button>
				<button :class="['btn-md', 'btn-primary', { 'btn-loading': isUpdatingExperience }]" @click="updateExperience" :disabled="!isValidEditExperienceInput || isUpdatingExperience">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20,6 9,17 4,12"></polyline>
					</svg>
					<span>{{ isUpdatingExperience ? 'Đang lưu...' : 'Lưu thay đổi' }}</span>
				</button>
			</div>
		</div>
	</base-modal>

	<!-- Modal: Thêm môn học -->
	<base-modal :is-open="showAddSubjectModal" title="Thêm môn học"
		description="Môn học là môn học bạn muốn dạy hoặc học" size="medium" @close="showAddSubjectModal = false">
		<div class="modal-content">
			<base-select v-model="newSubject.id" :options="listSubjects" label="Chọn môn học" type="search"
				placeholder="Chọn môn học" search-placeholder="Tìm kiếm môn học..."
				:error="formErrors.subject_id"></base-select>
			<base-input v-model="newSubject.years_of_experience" type="number" label="Số năm kinh nghiệm"
				placeholder="Nhập số năm kinh nghiệm" unit="năm" :min="0" :step="0.5" required
				:error="formErrors.years_of_experience"></base-input>

			<div class="level-group">
				<label>Cấp độ dạy và học phí</label>
				<div class="level-list">
					<div class="level-item" v-for="level in educationLevels" :key="level.id">
						<div class="level-left">
							<div class="level-icon" :class="level.class">
								<img class="icon-md" :src="level.image" :alt="level.name">
							</div>
							<input type="checkbox" :value="level.id" v-model="selectedLevelsOfSubject"
								@change="toggleLevelSelection(level)">
							<div class="level-name">{{ level.name }}</div>
						</div>
						<base-input v-model="level.price" type="number" placeholder="Nhập học phí" unit="đ/giờ" :min="0"
							:step="1" :disabled="!selectedLevelsOfSubject.includes(level.id)"></base-input>
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn-md btn-secondary" @click="showAddSubjectModal = false">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
					<span>Hủy</span>
				</button>
				<button :class="['btn-md', 'btn-primary', { 'btn-loading': isAddingSubject }]" @click="addNewSubject"
					:disabled="!isValidAddSubjectInput || isAddingSubject">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>{{ isAddingSubject ? 'Đang thêm...' : 'Thêm' }}</span>
				</button>
			</div>
		</div>
	</base-modal>

	<!-- Modal: Chỉnh sửa môn học -->
	<base-modal :is-open="showEditSubjectModal" title="Chỉnh sửa môn học"
		description="Môn học là môn học bạn muốn dạy hoặc học" size="medium" @close="showEditSubjectModal = false">
		<div class="modal-content">
			<base-select v-model="userDataAction.subject.subject_id" :options="listSubjects" label="Chọn môn học"
				type="search" placeholder="Chọn môn học" search-placeholder="Tìm kiếm môn học..."></base-select>
			<base-input v-model="userDataAction.subject.years_of_experience" type="number" label="Số năm kinh nghiệm"
				placeholder="Nhập số năm kinh nghiệm" unit="năm" :min="0" :step="0.5" required></base-input>

			<div class="level-group">
				<label>Cấp độ dạy và học phí</label>
				<div class="level-list">
					<div class="level-item" v-for="level in educationLevels" :key="level.id">
						<div class="level-left">
							<div class="level-icon" :class="level.class">
								<img class="icon-md" :src="level.image" :alt="level.name">
							</div>
							<input type="checkbox" :value="level.id" v-model="selectedLevelsOfSubject"
								@change="toggleLevelSelection(level)">
							<div class="level-name">{{ level.name }}</div>
						</div>
						<base-input v-model="level.price" type="number" placeholder="Nhập học phí" unit="đ/giờ" :min="0"
							:step="1" :disabled="!selectedLevelsOfSubject.includes(level.id)"></base-input>
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn-md btn-secondary" @click="showEditSubjectModal = false">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
					<span>Hủy</span>
				</button>
				<button :class="['btn-md', 'btn-danger', { 'btn-loading': isDeletingSubject }]" @click="deleteSubject(userDataAction.subject.id)" :disabled="isDeletingSubject">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 6h18"></path>
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
					</svg>
					<span>{{ isDeletingSubject ? 'Đang xóa...' : 'Xóa' }}</span>
				</button>
				<button :class="['btn-md', 'btn-primary', { 'btn-loading': isUpdatingSubject }]" @click="updateSubject" :disabled="!isValidEditSubjectInput || isUpdatingSubject">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
						<polyline points="17,21 17,13 7,13 7,21"></polyline>
						<polyline points="7,3 7,8 15,8"></polyline>
					</svg>
					<span>{{ isUpdatingSubject ? 'Đang cập nhật...' : 'Cập nhật' }}</span>
				</button>
			</div>
		</div>
	</base-modal>

	<!-- Modal: Thêm ngôn ngữ -->
	<base-modal :is-open="showAddLanguageModal" title="Thêm ngôn ngữ"
		description="Ngôn ngữ là ngôn ngữ bạn muốn dạy hoặc học" size="medium" @close="showAddLanguageModal = false">
		<div class="modal-content">
			<base-select v-model="newLanguage.language_id" :options="languageOptions" label="Ngôn ngữ"
				placeholder="Chọn ngôn ngữ"></base-select>
			<base-select v-model="newLanguage.level_language_id" :options="levelOptions" label="Trình độ"
				placeholder="Chọn trình độ"></base-select>
			<base-select v-model="newLanguage.level_language_id" :options="levelOptions" label="Trình độ"
				placeholder="Chọn trình độ"></base-select>
			<div class="form-group">
				<label class="checkbox-label">
					<input type="checkbox" v-model="newLanguage.is_native">
					Đây là ngôn ngữ bản ngữ của tôi
				</label>
			</div>
			<div class="modal-footer">
				<button class="btn-md btn-secondary" @click="showAddLanguageModal = false">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
					<span>Hủy</span>
				</button>
				<button :class="['btn-md', 'btn-primary', { 'btn-loading': isAddingLanguage }]" @click="addNewLanguage"
					:disabled="!isValidAddLanguageInput || isAddingLanguage">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					<span>{{ isAddingLanguage ? 'Đang thêm...' : 'Thêm' }}</span>
				</button>
			</div>
		</div>
	</base-modal>

	<!-- Modal: Sửa ngôn ngữ -->
	<base-modal :is-open="showEditLanguageModal" title="Chỉnh sửa ngôn ngữ"
		description="Ngôn ngữ là ngôn ngữ bạn muốn dạy hoặc học" size="medium" @close="showEditLanguageModal = false">
		<div class="modal-content">
			<base-select v-model="selectedLanguage.language_id" :options="languageOptions" label="Ngôn ngữ"
				placeholder="Chọn ngôn ngữ"></base-select>
			<base-select v-model="selectedLanguage.level_language_id" :options="levelOptions" label="Trình độ"
				placeholder="Chọn trình độ"></base-select>
			<base-select v-model="selectedLanguage.level_language_id" :options="levelOptions" label="Trình độ"
				placeholder="Chọn trình độ"></base-select>
			<div class="form-group">
				<label class="checkbox-label">
					<input type="checkbox" v-model="selectedLanguage.is_native">
					Đây là ngôn ngữ bản ngữ của tôi
				</label>
			</div>
			<div class="modal-footer">
				<button class="btn-md btn-secondary" @click="showEditLanguageModal = false">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
					<span>Hủy</span>
				</button>
				<button :class="['btn-md', 'btn-danger', { 'btn-loading': isDeletingLanguage }]" @click="handleDeleteLanguage(selectedLanguageId)" :disabled="isDeletingLanguage">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 6h18"></path>
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
					</svg>
					<span>{{ isDeletingLanguage ? 'Đang xóa...' : 'Xóa' }}</span>
				</button>
				<button :class="['btn-md', 'btn-primary', { 'btn-loading': isUpdatingLanguage }]" @click="updateLanguage"
					:disabled="!isValidEditLanguageInput || isUpdatingLanguage">
					<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
						<polyline points="17,21 17,13 7,13 7,21"></polyline>
						<polyline points="7,3 7,8 15,8"></polyline>
					</svg>
					<span>{{ isUpdatingLanguage ? 'Đang cập nhật...' : 'Cập nhật' }}</span>
				</button>
			</div>
		</div>
	</base-modal>

	<!-- Modal: Giới thiệu bản thân -->
	<base-modal :is-open="showProfileDescriptionModal" title="Giới thiệu bản thân"
		description="Giới thiệu bản thân là thông tin chính xác nhất về bạn, giúp khách hàng hiểu rõ hơn về bạn và chọn bạn để dạy con của họ"
		@close="showProfileDescriptionModal = false">
		<div class="form-grid">
			<div class="form-group">
				<base-input v-model="form.about_you" type="textarea" rows="6" required="true"
					label="Giới thiệu bản thân" placeholder="Xin chào tôi tên là..."
					:error="formErrors.about_you"></base-input>
				<div class="tips">
					<span class="tips_header">Mẹo</span>
					<span>Tiêu đề của bạn chính là tiêu đề cho quảng cáo! Hãy sử dụng nó để làm nổi bật kinh nghiệm và
						điểm khác biệt của bạn! Bạn không cần phải nêu rõ địa điểm và giá cả vì những thông tin này sẽ
						được đề cập ở nơi khác. Bạn là gia sư, vì vậy hãy kiểm tra chính tả và ngữ pháp, đồng thời tránh
						sử dụng từ viết tắt!</span>
				</div>
				<div class="note-group">
					<div class="note-wrapper">
						<div class="note-wrapper_header">
							<i class="feather feather-check">
								<svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							</i>
							<span>Nên làm</span>
						</div>
						<span>Tốt nghiệp học viện âm nhạc và là ca sĩ, giảng dạy thanh nhạc và guitar cho mọi trình độ.
							Phương pháp giảng dạy thoải mái!</span>
					</div>

					<div class="note-wrapper">
						<div class="note-wrapper_header">
							<i class="feather feather-x">
								<svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</i>
							<span>Không nên làm</span>
						</div>
						<span>Dạy hát và guitar ở New York với giá 40 đô la một giờ.</span>
					</div>
				</div>
			</div>
		</div>

		<div class="modal-footer">
			<button :class="['btn-md', 'btn-primary', { 'btn-loading': isSavingProfile }]" @click="saveProfile" :disabled="!isProfileDescriptionValid || isSavingProfile">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20,6 9,17 4,12"></polyline>
				</svg>
				<span>{{ isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi' }}</span>
			</button>
		</div>
	</base-modal>

	<!-- Modal: Video Giới Thiệu -->
	<base-modal :is-open="showVideoModal" title="Video Giới Thiệu"
		description="Video giới thiệu là video giới thiệu bản thân, giúp khách hàng hiểu rõ hơn về bạn và chọn bạn để dạy con của họ"
		@close="showVideoModal = false">
		<div class="main-content">
			<div class="form-group full-width">
				<base-input v-model="form.referral_link" label="Link YouTube *"
					placeholder="https://www.youtube.com/watch?v=..." :error="formErrors.referral_link"
					@update:modelValue="clearError('referral_link')"></base-input>
			</div>
			<div v-if="youtubeEmbedUrl" class="youtube-preview">
				<iframe :src="youtubeEmbedUrl" width="100%" height="315" frameborder="0" allowfullscreen></iframe>
			</div>
		</div>
		<div class="note-group">
			<div class="note-wrapper">
				<div class="note-wrapper_header">
					<i class="feather feather-check">
						<svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</i>
					<span>Nên làm</span>
				</div>
				<span>Video nên dài 2-5 phút, giới thiệu về bản thân, kinh nghiệm và phương pháp giảng dạy, cam kết với
					học sinh và phụ huynh</span>
			</div>

			<div class="note-wrapper">
				<div class="note-wrapper_header">
					<i class="feather feather-x">
						<svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</i>
					<span>Không nên làm</span>
				</div>
				<span>Video quá dài giới thiệu lan man về những thứ không liên quan ví dụ: nơi ở, học phí...</span>
			</div>
		</div>

		<div class="modal-footer">
			<button :class="['btn-md', 'btn-primary', { 'btn-loading': isSavingProfile }]" @click="saveProfile" :disabled="!isVideoIntroValid || isSavingProfile">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20,6 9,17 4,12"></polyline>
				</svg>
				<span>{{ isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi' }}</span>
			</button>
		</div>
	</base-modal>

	<!-- Modal: Identity Verification -->
	<base-modal :is-open="showIdentityVerificationModal" :header="false" size="large"
		@close="showIdentityVerificationModal = false">
		<IdentityVerification :existing-documents="userDataDetail.identity_document_images || []"
			@close="showIdentityVerificationModal = false" @success="handleIdentitySuccess" />
	</base-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useFormValidation } from '@/composables/useFormValidation';
import IdentityVerification from '@/components/profile/IdentityVerification.vue';

// ============================================
// SETUP
// ============================================
const { api } = useApi();
const { success, error: notifyError } = useNotification();
const configStore = useConfigStore();
const { formErrors, handleValidationError, clearError, clearAllErrors } = useFormValidation();
const { showImage } = useHelper();

const props = defineProps({
	userDataDetail: {
		type: Object,
		default: () => ({})
	}
});

const emit = defineEmits(['update-data']);

// ============================================
// STATE FOR PROFILE INFO
// ============================================
const showProfileDescriptionModal = ref(false);
const showVideoModal = ref(false);
const showIdentityVerificationModal = ref(false);

const form = ref({
	about_you: '',
	referral_link: '',
	first_name: '',
	last_name: '',
	sex: '',
	phone: '',
	email: '',
	provinces_id: '',
});

// Load initial data
const loadProfileInfo = () => {
	const userData = props.userDataDetail || {};
	form.value = {
		about_you: userData.about_you || '',
		referral_link: userData.referral_link || '',
		first_name: userData.first_name || '',
		last_name: userData.last_name || '',
		sex: userData.sex ?? '',
		phone: userData.phone || '',
		email: userData.email || '',
		provinces_id: userData.provinces_id || '',
	};
};

// Watch for prop changes to update form
watch(() => props.userDataDetail, () => {
	loadProfileInfo();
}, { immediate: true, deep: true });

// Computed for validation
const isProfileDescriptionValid = computed(() => {
	return !!form.value.about_you && form.value.about_you.trim().length > 0;
});

const isVideoIntroValid = computed(() => {
	return !!form.value.referral_link && form.value.referral_link.trim().length > 0;
});

const youtubeEmbedUrl = computed(() => {
	if (!form.value.referral_link) return '';
	const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
	const match = form.value.referral_link.match(regex);
	if (match && match[1]) {
		return `https://www.youtube.com/embed/${match[1]}`;
	}
	return '';
});

// Save Profile Info
const saveProfile = async () => {
	isSavingProfile.value = true;
	clearAllErrors();

	try {
		const formData = new FormData();

		// Updated fields
		formData.append('about_you', form.value.about_you);
		formData.append('referral_link', form.value.referral_link);

		const response = await api.apiPostFormData('me/profile-info', formData);
		if (response.data) {
			emit('update-data', response.data);
			success('Cập nhật hồ sơ thành công!');
			showProfileDescriptionModal.value = false;
			showVideoModal.value = false;
		} else {
			notifyError('Cập nhật hồ sơ thất bại!');
		}
	} catch (error) {
		handleValidationError(error, 'Có lỗi xảy ra khi lưu hồ sơ!');
	} finally {
		isSavingProfile.value = false;
	}
};

const handleIdentitySuccess = (newDocuments) => {
	showIdentityVerificationModal.value = false;
	if (newDocuments && newDocuments.length > 0) {
		const currentDocs = props.userDataDetail.identity_document_images || [];
		const updatedDocs = [...currentDocs, ...newDocuments];
		
		emit('update-data', {
			...props.userDataDetail,
			identity_document_images: updatedDocs
		});
	}
};

// ============================================
// COMPUTED
// ============================================
const educationLevels = ref([]);

watch(
	() => configStore.configuration?.education_levels,
	(levels) => {
		educationLevels.value = Array.isArray(levels)
			? levels.map((level) => ({ ...level }))
			: [];
	},
	{ immediate: true, deep: true },
);

const selectedLanguage = ref({
	language_id: '',
	level_language_id: '',
	is_native: false,
});

const subjectsConfig = computed(() => configStore.configuration?.subjects || []);
const languagesConfig = computed(() => configStore.configuration?.languages || []);
const levelOptions = computed(() => configStore.configuration?.level_languages || []);

const listSubjects = computed(() => {
	const addedIds = (props.userDataDetail.user_subjects || []).map((s) => s.subject_id);
	const editingId = showEditSubjectModal.value ? userDataAction.subject.subject_id : null;

	return subjectsConfig.value.map((subject) => ({
		id: subject.id,
		name: subject.name,
		disabled: addedIds.includes(subject.id) && subject.id !== editingId,
	}));
});

const languageOptions = computed(() => {
	const addedIds = (props.userDataDetail.user_languages || []).map((l) => l.language_id);
	const editingId = showEditLanguageModal.value ? selectedLanguage.value.language_id : null;

	return languagesConfig.value.map((lang) => ({
		id: lang.id,
		name: lang.name,
		disabled: addedIds.includes(lang.id) && lang.id !== editingId,
	}));
});

const isValidAddSubjectInput = computed(() => {
	return newSubject.id &&
		newSubject.years_of_experience &&
		selectedLevelsOfSubject.value.length > 0 &&
		selectedLevelsOfSubject.value.every(levelId => {
			const level = educationLevels.value.find(l => l.id === levelId);
			return level && level.price > 0;
		});
});

const isValidEditSubjectInput = computed(() => {
	return userDataAction.subject.years_of_experience &&
		selectedLevelsOfSubject.value.length > 0 &&
		selectedLevelsOfSubject.value.every(levelId => {
			const level = educationLevels.value.find(l => l.id === levelId);
			return level && level.price > 0;
		});
});

// ============================================
// STATE
// ============================================
const isLoading = ref(false);
const isSavingProfile = ref(false);
const isAddingEducation = ref(false);
const isUpdatingEducation = ref(false);
const isDeletingEducation = ref(false);
const isAddingExperience = ref(false);
const isUpdatingExperience = ref(false);
const isDeletingExperience = ref(false);
const isAddingSubject = ref(false);
const isUpdatingSubject = ref(false);
const isDeletingSubject = ref(false);
const isAddingLanguage = ref(false);
const isUpdatingLanguage = ref(false);
const isDeletingLanguage = ref(false);

// Modal states
const modals = reactive({
	addEducation: false,
	editEducation: false,
	addExperience: false,
	editExperience: false,
	addSubject: false,
	editSubject: false,
	addLanguage: false,
	editLanguage: false
});

// Aliases for backward compatibility
const showAddEducationModal = computed({
	get: () => modals.addEducation,
	set: (val) => modals.addEducation = val
});
const showEditEducationModal = computed({
	get: () => modals.editEducation,
	set: (val) => modals.editEducation = val
});
const showAddExperienceModal = computed({
	get: () => modals.addExperience,
	set: (val) => modals.addExperience = val
});
const showEditExperienceModal = computed({
	get: () => modals.editExperience,
	set: (val) => modals.editExperience = val
});
const showAddSubjectModal = computed({
	get: () => modals.addSubject,
	set: (val) => modals.addSubject = val
});
const showEditSubjectModal = computed({
	get: () => modals.editSubject,
	set: (val) => modals.editSubject = val
});
const showAddLanguageModal = computed({
	get: () => modals.addLanguage,
	set: (val) => modals.addLanguage = val
});
const showEditLanguageModal = computed({
	get: () => modals.editLanguage,
	set: (val) => modals.editLanguage = val
});

// File previews
const educationCertificatePreview = ref(null);
const editEducationCertificatePreview = ref(null);


// Subject related
const selectedLevelsOfSubject = ref([]);
const selectedLanguageId = ref(null);

// Form data
const newEducation = reactive({
	school_name: '',
	major: '',
	time: '',
	description: '',
	certificate: null
});

const newExperience = reactive({
	name: '',
	position: '',
	time: '',
	description: ''
});


const newSubject = reactive({
	id: '',
	name: '',
	years_of_experience: '',
	levels: []
});

const newLanguage = ref({
	language_id: '',
	level_language_id: '',
	is_native: false
});

const userDataAction = reactive({
	education: {
		id: '',
		school_name: '',
		major: '',
		time: '',
		description: '',
		certificate: null
	},
	experience: {
		name: '',
		position: '',
		time: '',
		description: ''
	},
	subject: {
		name: '',
		years_of_experience: '',
		levels: []
	}
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Update helper
const updateUserData = async (key, updater) => {
	isLoading.value = true;
	try {
		emit('update-data', {
			...props.userDataDetail,
			[key]: updater(props.userDataDetail[key] || [])
		});
	} finally {
		isLoading.value = false;
	}
};

// API wrapper
const apiCall = async (method, url, data, successMsg, errorMsg) => {
	try {
		const apiMethod = api[method];
		if (!apiMethod) {
			throw new Error(`API method ${method} is not defined`);
		}

		const hasPayload = !(data === undefined || data === null);
		const response = hasPayload ? await apiMethod(url, data) : await apiMethod(url);

		if (successMsg) {
			success(successMsg);
		}
		clearAllErrors();
		return response;
	} catch (error) {
		handleValidationError(error, errorMsg);
		if (errorMsg) {
			notifyError(errorMsg);
		}
		throw error;
	}
};

// File handling
const validateFile = (file) => {
	const maxSize = 10 * 1024 * 1024;
	if (file.size > maxSize) {
		notifyError('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
		return false;
	}
	if (!file.type.startsWith('image/')) {
		notifyError('Vui lòng chọn file ảnh hợp lệ.');
		return false;
	}
	return true;
};

const createPreview = (file) => (file ? URL.createObjectURL(file) : null);

const revokePreview = (preview) => {
	if (preview) URL.revokeObjectURL(preview);
};

const getEmbedUrl = (url) => {
	if (!url) return '';
	const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
	const match = url.match(regex);
	if (match && match[1]) {
		return `https://www.youtube.com/embed/${match[1]}`;
	}
	return '';
};

// ============================================
// EDUCATION HANDLERS
// ============================================
const showEditEducation = (data) => {
	Object.assign(userDataAction.education, data);
	editEducationCertificatePreview.value = data.certificate || null;
	modals.editEducation = true;
};

const addNewEducation = async () => {
	isAddingEducation.value = true;
	try {
		const formData = new FormData();
		Object.entries(newEducation).forEach(([key, value]) => {
			if (value) formData.append(key, value);
		});

		const response = await apiCall(
			'apiPostFormData',
			'me/education',
			formData,
			'Thêm học vấn thành công!',
			'Thêm học vấn thất bại!'
		);

		updateUserData('user_educations', (items) => [...items, response.data]);
		modals.addEducation = false;
		Object.assign(newEducation, { school_name: '', major: '', time: '', description: '', certificate: null });
		revokePreview(educationCertificatePreview.value);
		educationCertificatePreview.value = null;
	} finally {
		isAddingEducation.value = false;
	}
};

const updateEducation = async () => {
	isUpdatingEducation.value = true;
	try {
		const formData = new FormData();
		Object.entries(userDataAction.education).forEach(([key, value]) => {
			if (value) formData.append(key, value);
		});

		const response = await apiCall(
			'apiPostFormData',
			'me/update-education',
			formData,
			'Cập nhật học vấn thành công!',
			'Cập nhật học vấn thất bại!'
		);

		updateUserData('user_educations', (items) =>
			items.map(item => item.id === response.data.id ? response.data : item)
		);

		modals.editEducation = false;
		revokePreview(editEducationCertificatePreview.value);
		editEducationCertificatePreview.value = null;
	} finally {
		isUpdatingEducation.value = false;
	}
};

const deleteEducation = async (id) => {
	isDeletingEducation.value = true;
	try {
		await apiCall('apiDelete', `me/education/${id}`, null, 'Xóa học vấn thành công!', 'Xóa học vấn thất bại!');
		updateUserData('user_educations', (items) => items.filter(item => item.id !== id));
	} finally {
		isDeletingEducation.value = false;
	}
};

// ============================================
// EXPERIENCE HANDLERS
// ============================================
const showEditExperience = (data) => {
	Object.assign(userDataAction.experience, data);
	modals.editExperience = true;
};

const addNewExperience = async () => {
	isAddingExperience.value = true;
	try {
		const response = await apiCall(
			'apiPost',
			'me/experience',
			newExperience,
			'Thêm kinh nghiệm thành công!',
			'Thêm kinh nghiệm thất bại!'
		);

		updateUserData('user_experiences', (items) => [...items, response.data]);
		modals.addExperience = false;
		Object.assign(newExperience, { name: '', position: '', time: '', description: '' });
	} finally {
		isAddingExperience.value = false;
	}
};

const updateExperience = async () => {
	isUpdatingExperience.value = true;
	try {
		const response = await apiCall(
			'apiPut',
			'me/experience',
			userDataAction.experience,
			'Cập nhật kinh nghiệm thành công!',
			'Cập nhật kinh nghiệm thất bại!'
		);

		updateUserData('user_experiences', (items) =>
			items.map(item => item.id === response.data.id ? response.data : item)
		);
		modals.editExperience = false;
	} finally {
		isUpdatingExperience.value = false;
	}
};

const deleteExperience = async (id) => {
	isDeletingExperience.value = true;
	try {
		await apiCall('apiDelete', `me/experience/${id}`, null, 'Xóa kinh nghiệm thành công!', 'Xóa kinh nghiệm thất bại!');
		updateUserData('user_experiences', (items) => items.filter(item => item.id !== id));
	} finally {
		isDeletingExperience.value = false;
	}
};


// ============================================
// SUBJECT HANDLERS
// ============================================
const showCreateSubjectModal = () => {
	newSubject.id = '';
	newSubject.name = '';
	newSubject.years_of_experience = '';
	selectedLevelsOfSubject.value = [];
	educationLevels.value.forEach(level => level.price = '');
	modals.addSubject = true;
};

const showEditSubject = (data) => {
	Object.assign(userDataAction.subject, data);
	selectedLevelsOfSubject.value = [];
	educationLevels.value.forEach(level => level.price = '');

	if (data.user_subject_levels?.length > 0) {
		data.user_subject_levels.forEach(levelData => {
			selectedLevelsOfSubject.value.push(levelData.level_id);
			const level = educationLevels.value.find(l => l.id === levelData.level_id);
			if (level) level.price = levelData.price;
		});
	}
	modals.editSubject = true;
};

const toggleLevelSelection = (level) => {
	if (!selectedLevelsOfSubject.value.includes(level.id)) {
		level.price = '';
	}
};

const addNewSubject = async () => {
	isAddingSubject.value = true;
	try {
		const levels = selectedLevelsOfSubject.value.map(levelId => ({
			level_id: levelId,
			price: educationLevels.value.find(l => l.id === levelId).price
		}));

		const response = await apiCall(
			'apiPost',
			'me/subject',
			{ subject_id: newSubject.id, years_of_experience: newSubject.years_of_experience, levels },
			'Thêm môn học thành công!',
			'Thêm môn học thất bại!'
		);

		updateUserData('user_subjects', (items) => [...items, response.data]);
		modals.addSubject = false;
		Object.assign(newSubject, { id: '', name: '', years_of_experience: '', levels: [] });
		selectedLevelsOfSubject.value = [];
	} finally {
		isAddingSubject.value = false;
	}
};

const updateSubject = async () => {
	isUpdatingSubject.value = true;
	try {
		const levels = selectedLevelsOfSubject.value.map(levelId => ({
			level_id: levelId,
			price: educationLevels.value.find(l => l.id === levelId).price
		}));

		const response = await apiCall(
			'apiPut',
			'me/subject',
			{
				user_subject_id: userDataAction.subject.id,
				subject_id: userDataAction.subject.subject_id,
				years_of_experience: userDataAction.subject.years_of_experience,
				levels
			},
			'Cập nhật môn học thành công!',
			'Cập nhật môn học thất bại!'
		);

		updateUserData('user_subjects', (items) =>
			items.map(item => item.id === response.data.id ? response.data : item)
		);
		modals.editSubject = false;
	} finally {
		isUpdatingSubject.value = false;
	}
};

const deleteSubject = async (id) => {
	isDeletingSubject.value = true;
	try {
		await apiCall('apiDelete', `me/subject/${id}`, null, 'Xóa môn học thành công!', 'Xóa môn học thất bại!');
		updateUserData('user_subjects', (items) => items.filter(item => item.id !== id));
	} finally {
		isDeletingSubject.value = false;
	}
};

// ============================================
// LANGUAGE HANDLERS
// ============================================
const handleEditLanguage = (language) => {
	selectedLanguageId.value = language.id;
	selectedLanguage.value = {
		id: language.id,
		language_id: language.language_id,
		level_language_id: language.level_language_id,
		is_native: language.is_native
	};
	modals.editLanguage = true;
};

const addNewLanguage = async () => {
	isAddingLanguage.value = true;
	try {
		const response = await apiCall(
			'apiPost',
			'me/languages',
			newLanguage.value,
			'Thêm ngôn ngữ thành công!',
			'Thêm ngôn ngữ thất bại!'
		);

		updateUserData('user_languages', (items) => [...items, response.data]);
		modals.addLanguage = false;
		newLanguage.value = { language_id: '', level_language_id: '', is_native: false };
	} finally {
		isAddingLanguage.value = false;
	}
};

const updateLanguage = async () => {
	isUpdatingLanguage.value = true;
	try {
		const response = await apiCall(
			'apiPut',
			`me/languages/${selectedLanguageId.value}`,
			selectedLanguage.value,
			'Cập nhật ngôn ngữ thành công!',
			'Cập nhật ngôn ngữ thất bại!'
		);

		updateUserData('user_languages', (items) =>
			items.map(item => item.id === selectedLanguageId.value ? response.data : item)
		);
		modals.editLanguage = false;
	} finally {
		isUpdatingLanguage.value = false;
	}
};

const handleDeleteLanguage = async (id) => {
	isDeletingLanguage.value = true;
	try {
		await apiCall('apiDelete', `me/languages/${id}`, null, 'Xóa ngôn ngữ thành công!', 'Xóa ngôn ngữ thất bại!');
		updateUserData('user_languages', (items) => items.filter(item => item.id !== id));
	} finally {
		isDeletingLanguage.value = false;
	}
};

// ============================================
// VALIDATION
// ============================================
const isValidAddEducationInput = computed(() => {
	return newEducation.school_name &&
		newEducation.major &&
		newEducation.time &&
		newEducation.description;
});

const isValidEditEducationInput = computed(() => {
	return userDataAction.education.school_name &&
		userDataAction.education.major &&
		userDataAction.education.time &&
		userDataAction.education.description;
});

const isValidAddExperienceInput = computed(() => {
	return newExperience.name &&
		newExperience.position &&
		newExperience.time &&
		newExperience.description;
});

const isValidEditExperienceInput = computed(() => {
	return userDataAction.experience.name &&
		userDataAction.experience.position &&
		userDataAction.experience.time &&
		userDataAction.experience.description;
});

const isValidAddLanguageInput = computed(() => {
	return newLanguage.value.language_id &&
		newLanguage.value.level_language_id;
});

const isValidEditLanguageInput = computed(() => {
	return selectedLanguage.value.language_id &&
		selectedLanguage.value.level_language_id;
});

// ============================================
// FILE UPLOAD HANDLERS
// ============================================
const onFileChange = (event, key) => {
	const file = event.target.files[0];
	if (!file || !validateFile(file)) {
		event.target.value = '';
		return;
	}

	if (key === 'certificate') {
		newEducation.certificate = file;
		revokePreview(educationCertificatePreview.value);
		educationCertificatePreview.value = createPreview(file);
	} else if (key === 'edit_certificate') {
		userDataAction.education.certificate = file;
		revokePreview(editEducationCertificatePreview.value);
		editEducationCertificatePreview.value = createPreview(file);
	}
	success('Đã chọn ảnh bằng cấp');
};

const triggerFile = (id) => {
	const input = document.getElementById(id);
	if (input) {
		input.value = '';
		input.click();
	}
};

const removeFile = (key) => {
	if (key === 'certificate') {
		newEducation.certificate = null;
		revokePreview(educationCertificatePreview.value);
		educationCertificatePreview.value = null;
	} else if (key === 'edit_certificate') {
		userDataAction.education.certificate = null;
		revokePreview(editEducationCertificatePreview.value);
		editEducationCertificatePreview.value = null;
	}
};

// Cleanup watchers
watch(() => newEducation.certificate, (file) => {
	if (!file && educationCertificatePreview.value) {
		revokePreview(educationCertificatePreview.value);
		educationCertificatePreview.value = null;
	}
});

watch(() => userDataAction.education.certificate, (file) => {
	if (!file && editEducationCertificatePreview.value) {
		revokePreview(editEducationCertificatePreview.value);
		editEducationCertificatePreview.value = null;
	}
});
</script>

<style scoped>
@import url('~/assets/css/profileNew.css');

.verification-status-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.verification-status-main {
    font-weight: 500;
    color: #1f2937;
}

.verification-status-sub {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Identity Verification Styles */
.identity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.identity-card {
    cursor: pointer;
    transition: all 0.2s;
}

.identity-card:hover {
    border-color: var(--color-primary);
}

.identity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.identity-left {
    display: flex;
    gap: 12px;
}

.identity-right {
    display: flex;
    align-items: center;
}

.identity-info {
    display: flex;
    flex-direction: column;
}

.identity-name {
    font-weight: 600;
    color: #1f2937;
    font-size: var(--font-size-base);
}

.identity-side {
    font-size: var(--font-size-mini);
    color: #6b7280;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: var(--font-size-mini);
    font-weight: 600;
}

.status-badge.approved {
    background-color: #dcfce7;
    color: #166534;
}

.status-badge.pending {
    background-color: #fef9c3;
    color: #854d0e;
}

.status-badge.rejected {
    background-color: #fee2e2;
    color: #991b1b;
}

.identity-image img {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: transform 0.2s;
}

.identity-image img:hover {
    transform: scale(1.05);
}

/* Info Grid Styles */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
}

.info-item:hover {
    background: #fff;
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #fff;
    color: var(--color-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.info-item .label {
    font-size: var(--font-size-mini);
    color: #6b7280;
}

.info-item .value {
    font-weight: 500;
    color: #1f2937;
	font-size: var(--font-size-small);
}

@media (max-width: 640px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
}

/* Video Preview Styles */
.video-preview-container {
    margin-top: 12px;
    border-radius: 12px;
    overflow: hidden;
    background-color: #000;
}
</style>
