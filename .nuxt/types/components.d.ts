
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

interface _GlobalComponents {
  'BaseDatePicker': typeof import("../../components/common/BaseDatePicker.vue")['default']
  'BaseInput': typeof import("../../components/common/BaseInput.vue")['default']
  'BaseLoading': typeof import("../../components/common/BaseLoading.vue")['default']
  'BaseMenu': typeof import("../../components/common/BaseMenu.vue")['default']
  'BaseModal': typeof import("../../components/common/BaseModal.vue")['default']
  'BaseMoreMenu': typeof import("../../components/common/BaseMoreMenu.vue")['default']
  'BasePagination': typeof import("../../components/common/BasePagination.vue")['default']
  'BaseSelect': typeof import("../../components/common/BaseSelect.vue")['default']
  'BaseStatusTabs': typeof import("../../components/common/BaseStatusTabs.vue")['default']
  'ImageCropModal': typeof import("../../components/common/ImageCropModal.vue")['default']
  'Logo': typeof import("../../components/common/Logo.vue")['default']
  'Notification': typeof import("../../components/common/Notification.vue")['default']
  'NotificationPreview': typeof import("../../components/common/NotificationPreview.vue")['default']
  'SendMessage': typeof import("../../components/common/SendMessage.vue")['default']
  'TutorCard': typeof import("../../components/common/TutorCard.vue")['default']
  'BookingCardList': typeof import("../../components/booking/BookingCardList.vue")['default']
  'BookingSuccess': typeof import("../../components/booking/BookingSuccess.vue")['default']
  'BookingComplaintModal': typeof import("../../components/booking/ComplaintModal.vue")['default']
  'BookingConfirmBookingNew': typeof import("../../components/booking/ConfirmBookingNew.vue")['default']
  'BookingLessonInformation': typeof import("../../components/booking/LessonInformation.vue")['default']
  'BookingPackageSelection': typeof import("../../components/booking/PackageSelection.vue")['default']
  'BookingRealBooking': typeof import("../../components/booking/RealBooking.vue")['default']
  'BookingReviewModal': typeof import("../../components/booking/ReviewModal.vue")['default']
  'LayoutFooter': typeof import("../../components/layout/Footer.vue")['default']
  'LayoutHeader': typeof import("../../components/layout/Header.vue")['default']
  'LayoutMain': typeof import("../../components/layout/Main.vue")['default']
  'ProfileOverviewNew': typeof import("../../components/profile/OverviewNew.vue")['default']
  'ProfileInfoNew': typeof import("../../components/profile/ProfileInfoNew.vue")['default']
  'ProfileScheduleNew': typeof import("../../components/profile/ScheduleNew.vue")['default']
  'ProfileWalletBalance': typeof import("../../components/profile/WalletBalance.vue")['default']
  'UserDetailOverviewTab': typeof import("../../components/userDetail/OverviewTab.vue")['default']
  'UserDetailReviewsTab': typeof import("../../components/userDetail/ReviewsTab.vue")['default']
  'NuxtWelcome': typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  'NuxtLayout': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  'NuxtErrorBoundary': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  'ClientOnly': typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  'DevOnly': typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  'ServerPlaceholder': typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  'NuxtLink': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  'NuxtLoadingIndicator': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  'NuxtTime': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  'NuxtRouteAnnouncer': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  'NuxtImg': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  'NuxtPicture': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  'NuxtPage': typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  'NoScript': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  'Link': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  'Base': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  'Title': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  'Meta': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  'Style': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  'Head': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  'Html': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  'Body': typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  'NuxtIsland': typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  'LazyBaseDatePicker': LazyComponent<typeof import("../../components/common/BaseDatePicker.vue")['default']>
  'LazyBaseInput': LazyComponent<typeof import("../../components/common/BaseInput.vue")['default']>
  'LazyBaseLoading': LazyComponent<typeof import("../../components/common/BaseLoading.vue")['default']>
  'LazyBaseMenu': LazyComponent<typeof import("../../components/common/BaseMenu.vue")['default']>
  'LazyBaseModal': LazyComponent<typeof import("../../components/common/BaseModal.vue")['default']>
  'LazyBaseMoreMenu': LazyComponent<typeof import("../../components/common/BaseMoreMenu.vue")['default']>
  'LazyBasePagination': LazyComponent<typeof import("../../components/common/BasePagination.vue")['default']>
  'LazyBaseSelect': LazyComponent<typeof import("../../components/common/BaseSelect.vue")['default']>
  'LazyBaseStatusTabs': LazyComponent<typeof import("../../components/common/BaseStatusTabs.vue")['default']>
  'LazyImageCropModal': LazyComponent<typeof import("../../components/common/ImageCropModal.vue")['default']>
  'LazyLogo': LazyComponent<typeof import("../../components/common/Logo.vue")['default']>
  'LazyNotification': LazyComponent<typeof import("../../components/common/Notification.vue")['default']>
  'LazyNotificationPreview': LazyComponent<typeof import("../../components/common/NotificationPreview.vue")['default']>
  'LazySendMessage': LazyComponent<typeof import("../../components/common/SendMessage.vue")['default']>
  'LazyTutorCard': LazyComponent<typeof import("../../components/common/TutorCard.vue")['default']>
  'LazyBookingCardList': LazyComponent<typeof import("../../components/booking/BookingCardList.vue")['default']>
  'LazyBookingSuccess': LazyComponent<typeof import("../../components/booking/BookingSuccess.vue")['default']>
  'LazyBookingComplaintModal': LazyComponent<typeof import("../../components/booking/ComplaintModal.vue")['default']>
  'LazyBookingConfirmBookingNew': LazyComponent<typeof import("../../components/booking/ConfirmBookingNew.vue")['default']>
  'LazyBookingLessonInformation': LazyComponent<typeof import("../../components/booking/LessonInformation.vue")['default']>
  'LazyBookingPackageSelection': LazyComponent<typeof import("../../components/booking/PackageSelection.vue")['default']>
  'LazyBookingRealBooking': LazyComponent<typeof import("../../components/booking/RealBooking.vue")['default']>
  'LazyBookingReviewModal': LazyComponent<typeof import("../../components/booking/ReviewModal.vue")['default']>
  'LazyLayoutFooter': LazyComponent<typeof import("../../components/layout/Footer.vue")['default']>
  'LazyLayoutHeader': LazyComponent<typeof import("../../components/layout/Header.vue")['default']>
  'LazyLayoutMain': LazyComponent<typeof import("../../components/layout/Main.vue")['default']>
  'LazyProfileOverviewNew': LazyComponent<typeof import("../../components/profile/OverviewNew.vue")['default']>
  'LazyProfileInfoNew': LazyComponent<typeof import("../../components/profile/ProfileInfoNew.vue")['default']>
  'LazyProfileScheduleNew': LazyComponent<typeof import("../../components/profile/ScheduleNew.vue")['default']>
  'LazyProfileWalletBalance': LazyComponent<typeof import("../../components/profile/WalletBalance.vue")['default']>
  'LazyUserDetailOverviewTab': LazyComponent<typeof import("../../components/userDetail/OverviewTab.vue")['default']>
  'LazyUserDetailReviewsTab': LazyComponent<typeof import("../../components/userDetail/ReviewsTab.vue")['default']>
  'LazyNuxtWelcome': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  'LazyNuxtLayout': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  'LazyNuxtErrorBoundary': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  'LazyClientOnly': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  'LazyDevOnly': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  'LazyServerPlaceholder': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  'LazyNuxtLink': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  'LazyNuxtTime': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  'LazyNuxtImg': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  'LazyNuxtPicture': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  'LazyNuxtPage': LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  'LazyNoScript': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  'LazyLink': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  'LazyBase': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  'LazyTitle': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  'LazyMeta': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  'LazyStyle': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  'LazyHead': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  'LazyHtml': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  'LazyBody': LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  'LazyNuxtIsland': LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
