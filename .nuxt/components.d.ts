
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const AdvancedFilterModal: typeof import("../components/common/AdvancedFilterModal.vue")['default']
export const BaseDatePicker: typeof import("../components/common/BaseDatePicker.vue")['default']
export const BaseInput: typeof import("../components/common/BaseInput.vue")['default']
export const BaseLoading: typeof import("../components/common/BaseLoading.vue")['default']
export const BaseMenu: typeof import("../components/common/BaseMenu.vue")['default']
export const BaseModal: typeof import("../components/common/BaseModal.vue")['default']
export const BaseMoreMenu: typeof import("../components/common/BaseMoreMenu.vue")['default']
export const BasePageError: typeof import("../components/common/BasePageError.vue")['default']
export const BasePagination: typeof import("../components/common/BasePagination.vue")['default']
export const BaseSelect: typeof import("../components/common/BaseSelect.vue")['default']
export const BaseStatusTabs: typeof import("../components/common/BaseStatusTabs.vue")['default']
export const ImageCropModal: typeof import("../components/common/ImageCropModal.vue")['default']
export const Logo: typeof import("../components/common/Logo.vue")['default']
export const Notification: typeof import("../components/common/Notification.vue")['default']
export const NotificationPreview: typeof import("../components/common/NotificationPreview.vue")['default']
export const SendMessage: typeof import("../components/common/SendMessage.vue")['default']
export const TutorCard: typeof import("../components/common/TutorCard.vue")['default']
export const BookingCardList: typeof import("../components/booking/BookingCardList.vue")['default']
export const BookingListStudent: typeof import("../components/booking/BookingListStudent.vue")['default']
export const BookingListTutor: typeof import("../components/booking/BookingListTutor.vue")['default']
export const BookingSuccess: typeof import("../components/booking/BookingSuccess.vue")['default']
export const BookingComplaintModal: typeof import("../components/booking/ComplaintModal.vue")['default']
export const BookingConfirmBookingNew: typeof import("../components/booking/ConfirmBookingNew.vue")['default']
export const BookingLessonInformation: typeof import("../components/booking/LessonInformation.vue")['default']
export const BookingPackageSelection: typeof import("../components/booking/PackageSelection.vue")['default']
export const BookingRealBooking: typeof import("../components/booking/RealBooking.vue")['default']
export const BookingReviewModal: typeof import("../components/booking/ReviewModal.vue")['default']
export const LayoutFooter: typeof import("../components/layout/Footer.vue")['default']
export const LayoutHeader: typeof import("../components/layout/Header.vue")['default']
export const LayoutMain: typeof import("../components/layout/Main.vue")['default']
export const ProfileOverviewNew: typeof import("../components/profile/OverviewNew.vue")['default']
export const ProfileScheduleNew: typeof import("../components/profile/ScheduleNew.vue")['default']
export const ProfileWalletBalance: typeof import("../components/profile/WalletBalance.vue")['default']
export const SettingsGlobalPreferences: typeof import("../components/settings/GlobalPreferences.vue")['default']
export const SettingsLoginSecurity: typeof import("../components/settings/LoginSecurity.vue")['default']
export const SettingsNotifications: typeof import("../components/settings/Notifications.vue")['default']
export const SettingsPayments: typeof import("../components/settings/Payments.vue")['default']
export const SettingsPersonalInfo: typeof import("../components/settings/PersonalInfo.vue")['default']
export const SettingsPrivacy: typeof import("../components/settings/Privacy.vue")['default']
export const SettingsTaxes: typeof import("../components/settings/Taxes.vue")['default']
export const UserDetailOverviewTab: typeof import("../components/userDetail/OverviewTab.vue")['default']
export const UserDetailReviewsTab: typeof import("../components/userDetail/ReviewsTab.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAdvancedFilterModal: LazyComponent<typeof import("../components/common/AdvancedFilterModal.vue")['default']>
export const LazyBaseDatePicker: LazyComponent<typeof import("../components/common/BaseDatePicker.vue")['default']>
export const LazyBaseInput: LazyComponent<typeof import("../components/common/BaseInput.vue")['default']>
export const LazyBaseLoading: LazyComponent<typeof import("../components/common/BaseLoading.vue")['default']>
export const LazyBaseMenu: LazyComponent<typeof import("../components/common/BaseMenu.vue")['default']>
export const LazyBaseModal: LazyComponent<typeof import("../components/common/BaseModal.vue")['default']>
export const LazyBaseMoreMenu: LazyComponent<typeof import("../components/common/BaseMoreMenu.vue")['default']>
export const LazyBasePageError: LazyComponent<typeof import("../components/common/BasePageError.vue")['default']>
export const LazyBasePagination: LazyComponent<typeof import("../components/common/BasePagination.vue")['default']>
export const LazyBaseSelect: LazyComponent<typeof import("../components/common/BaseSelect.vue")['default']>
export const LazyBaseStatusTabs: LazyComponent<typeof import("../components/common/BaseStatusTabs.vue")['default']>
export const LazyImageCropModal: LazyComponent<typeof import("../components/common/ImageCropModal.vue")['default']>
export const LazyLogo: LazyComponent<typeof import("../components/common/Logo.vue")['default']>
export const LazyNotification: LazyComponent<typeof import("../components/common/Notification.vue")['default']>
export const LazyNotificationPreview: LazyComponent<typeof import("../components/common/NotificationPreview.vue")['default']>
export const LazySendMessage: LazyComponent<typeof import("../components/common/SendMessage.vue")['default']>
export const LazyTutorCard: LazyComponent<typeof import("../components/common/TutorCard.vue")['default']>
export const LazyBookingCardList: LazyComponent<typeof import("../components/booking/BookingCardList.vue")['default']>
export const LazyBookingListStudent: LazyComponent<typeof import("../components/booking/BookingListStudent.vue")['default']>
export const LazyBookingListTutor: LazyComponent<typeof import("../components/booking/BookingListTutor.vue")['default']>
export const LazyBookingSuccess: LazyComponent<typeof import("../components/booking/BookingSuccess.vue")['default']>
export const LazyBookingComplaintModal: LazyComponent<typeof import("../components/booking/ComplaintModal.vue")['default']>
export const LazyBookingConfirmBookingNew: LazyComponent<typeof import("../components/booking/ConfirmBookingNew.vue")['default']>
export const LazyBookingLessonInformation: LazyComponent<typeof import("../components/booking/LessonInformation.vue")['default']>
export const LazyBookingPackageSelection: LazyComponent<typeof import("../components/booking/PackageSelection.vue")['default']>
export const LazyBookingRealBooking: LazyComponent<typeof import("../components/booking/RealBooking.vue")['default']>
export const LazyBookingReviewModal: LazyComponent<typeof import("../components/booking/ReviewModal.vue")['default']>
export const LazyLayoutFooter: LazyComponent<typeof import("../components/layout/Footer.vue")['default']>
export const LazyLayoutHeader: LazyComponent<typeof import("../components/layout/Header.vue")['default']>
export const LazyLayoutMain: LazyComponent<typeof import("../components/layout/Main.vue")['default']>
export const LazyProfileOverviewNew: LazyComponent<typeof import("../components/profile/OverviewNew.vue")['default']>
export const LazyProfileScheduleNew: LazyComponent<typeof import("../components/profile/ScheduleNew.vue")['default']>
export const LazyProfileWalletBalance: LazyComponent<typeof import("../components/profile/WalletBalance.vue")['default']>
export const LazySettingsGlobalPreferences: LazyComponent<typeof import("../components/settings/GlobalPreferences.vue")['default']>
export const LazySettingsLoginSecurity: LazyComponent<typeof import("../components/settings/LoginSecurity.vue")['default']>
export const LazySettingsNotifications: LazyComponent<typeof import("../components/settings/Notifications.vue")['default']>
export const LazySettingsPayments: LazyComponent<typeof import("../components/settings/Payments.vue")['default']>
export const LazySettingsPersonalInfo: LazyComponent<typeof import("../components/settings/PersonalInfo.vue")['default']>
export const LazySettingsPrivacy: LazyComponent<typeof import("../components/settings/Privacy.vue")['default']>
export const LazySettingsTaxes: LazyComponent<typeof import("../components/settings/Taxes.vue")['default']>
export const LazyUserDetailOverviewTab: LazyComponent<typeof import("../components/userDetail/OverviewTab.vue")['default']>
export const LazyUserDetailReviewsTab: LazyComponent<typeof import("../components/userDetail/ReviewsTab.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
