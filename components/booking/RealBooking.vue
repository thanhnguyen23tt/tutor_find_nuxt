<template>
    <div class="booking-page">
        <div class="container">
            <div v-if="showStepper" class="lesson-stepper">
                <div
                    v-for="step in stepBooking"
                    :key="step.id"
                    class="step-item"
                    :class="{
                        active: currentStep === step.id,
                        completed: currentStep > step.id
                    }"
                >
                    <div class="step-circle">
                        <svg v-if="currentStep > step.id" class="step-icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <component v-else :is="getStepIcon(step.id)" class="step-icon icon-lg" />
                    </div>
                    <div class="step-info">
                        <div class="step-label">Bước {{ step.id }}</div>
                        <div class="step-title">{{ step.name }}</div>
                    </div>
                </div>
            </div>
        </div>

        <component
            :is="getCurrentStepComponent"
            v-if="Object.keys(tutorInfo).length > 0 && getCurrentStepComponent"
            @back="prevStep"
            @next="nextStep"
            @submit="submitBooking"
            :tutor-info="tutorInfo"
        />
    </div>
</template>

<script setup>
definePageMeta({
	middleware() {
		useLayoutStore().setHiddenFooter(true)
	}
})

import { ref, onMounted, computed, h } from 'vue'
import LessonInformation from './LessonInformation.vue'
import ConfirmBooking from './ConfirmBookingNew.vue'

const currentStep = ref(1);
const config = useConfig();
const stepBooking = computed(() => config.step_booking);

const props = defineProps({
    tutorInfo: {
        type: Object,
        required: true
    }
})

// Map component names to actual components
const componentMap = {
    'LessonInformation': LessonInformation,
    'ConfirmBookingNew': ConfirmBooking,
}

// Get current step component dynamically
const getCurrentStepComponent = computed(() => {
    const step = stepBooking.value.find(s => s.id === currentStep.value);
    return step ? componentMap[step.component] : null;
})

const showStepper = computed(() => stepBooking.value.length > 0);

// Get icon for each step
const getStepIcon = (stepId) => {
    const icons = {
        1: () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
            h('path', { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
            h('path', { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })
        ]),
        2: () => h('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
            h('path', { d: "m7.5 4.27 9 5.15" }),
            h('path', { d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" }),
            h('path', { d: "m3.3 7 8.7 5 8.7-5" }),
            h('path', { d: "M12 22V12" })
        ]),
        3: () => h('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
            h('circle', { cx: "12", cy: "12", r: "10" }),
            h('path', { d: "M9 12l2 2 4-4" })
        ]),
        4: () => h('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
            h('rect', { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
            h('line', { x1: "8", y1: "21", x2: "16", y2: "21" }),
            h('line', { x1: "12", y1: "17", x2: "12", y2: "21" })
        ])
    }
    return icons[stepId] || icons[1];
}

const nextStep = () => {
    if (currentStep.value < stepBooking.value.length) {
        currentStep.value++
        saveCurrentStep();
    }
}

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--
        saveCurrentStep();
    }
}

const { getBookingData, setBookingData } = useBookingSession()

const saveCurrentStep = () => {
    const bookingData = getBookingData() || {}

    const bookingDataNew = {
        ...bookingData,
        currentStep: currentStep.value,
    }

    if (bookingDataNew && 'mode' in bookingDataNew) {
        delete bookingDataNew.mode;
    }

    setBookingData(bookingDataNew);
}

const getCurrentStep = () => {
    if (!process.client) {
        currentStep.value = 1
        return
    }

    const bookingData = getBookingData();
    currentStep.value = bookingData?.currentStep ?? 1;
}

onMounted(() => {
    getCurrentStep();
})
</script>


<style scoped>
@import url("~/assets/css/RealBooking.css");
</style>
