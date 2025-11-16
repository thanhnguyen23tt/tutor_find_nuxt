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

const submitBooking = () => {
    console.log('Booking submitted')
}

onMounted(() => {
    getCurrentStep();
})
</script>


<style scoped>
/* Modern Booking Page */
.booking-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 2rem 0;
    position: relative;
}

.booking-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
    pointer-events: none;
}

/* Modern Stepper Design */
.lesson-stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 2rem 3rem;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    position: relative;
    overflow: hidden;
}

.lesson-stepper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    position: relative;
    flex: 1;
    max-width: 200px;
}

/* .step-item::after {
    content: '';
    position: absolute;
    top: 1.5rem;
    left: 50%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
    z-index: 1;
    transform: translateX(50%);
}

.step-item:last-child::after {
    display: none;
}

.step-item.completed::after {
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
} */

.step-circle {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    border: 3px solid #e2e8f0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-circle::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
}

.step-icon {
    color: #94a3b8;
    transition: all 0.3s ease;
    width: 1.5rem;
    height: 1.5rem;
}

.step-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
}

.step-label {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.step-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #475569;
    line-height: 1.3;
    transition: all 0.3s ease;
}

/* Active State */
.step-item.active .step-circle {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
    transform: scale(1.1);
}

.step-item.active .step-circle::before {
    opacity: 1;
}

.step-item.active .step-icon {
    color: #fff;
    transform: scale(1.1);
}

.step-item.active .step-title {
    color: var(--color-primary);
    font-weight: 700;
}

.step-item.active .step-label {
    color: var(--color-primary);
    font-weight: 600;
}

/* Completed State */
.step-item.completed .step-circle {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
}

.step-item.completed .step-icon {
    color: #fff;
}

.step-item.completed .step-title {
    color: var(--color-primary);
    font-weight: 600;
}

.step-item.completed .step-label {
    color: var(--color-primary);
    font-weight: 500;
}

/* Hover Effects */
.step-item:hover .step-circle {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.step-item:hover .step-title {
    color: var(--color-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .lesson-stepper {
        padding: 1.5rem 2rem;
        gap: 1rem;
    }

    .step-circle {
        width: 3rem;
        height: 3rem;
    }

    .step-icon {
        width: 1.25rem;
        height: 1.25rem;
    }

    .step-title {
        font-size: 0.9rem;
    }

    .step-label {
        font-size: 0.75rem;
    }
}

@media (max-width: 768px) {
    .booking-page {
        padding: 1rem 0;
    }

    .lesson-stepper {
        padding: 1.25rem 1.5rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
    }

    .step-item {
        gap: 0.75rem;
    }

    .step-circle {
        width: 2.5rem;
        height: 2.5rem;
    }

    .step-icon {
        width: 1rem;
        height: 1rem;
    }

    .step-title {
        font-size: 0.8rem;
        display: none;
    }

    .step-label {
        font-size: 0.7rem;
    }

    .step-item::after {
        top: 1.25rem;
    }
}

@media (max-width: 640px) {
    .lesson-stepper {
        padding: 1rem;
        gap: 0.5rem;
    }

    .step-item {
        gap: 0.5rem;
    }


    .step-label {
        font-size: 0.65rem;
    }

    .step-item::after {
        top: 1rem;
    }
}

/* Animation for step transitions */
@keyframes stepProgress {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

.step-item.active .step-circle {
    animation: stepProgress 0.6s ease-in-out;
}

/* Loading state for stepper */
.lesson-stepper.loading {
    opacity: 0.7;
    pointer-events: none;
}

.lesson-stepper.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2rem;
    height: 2rem;
    border: 2px solid #e2e8f0;
    border-top: 2px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}
</style>
