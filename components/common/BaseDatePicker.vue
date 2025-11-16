<template>
<div class="date-picker">
    <div class="header">
        <button @click="prevWeek" :disabled="currentWeekIndex === 0">‹</button>
        <span class="week-range-label">{{ weekRangeLabel }}</span>
        <button @click="nextWeek" :disabled="currentWeekIndex === weeks.length - 1">›</button>
    </div>
    <div class="days">
        <div v-for="(day, idx) in weeks[currentWeekIndex]" :key="day.date" :class="['day', { selected: isSelected(day.date), today: isToday(day.date), disabled: isPastDate(day.date) }]" @click="!isPastDate(day.date) && selectDate(day.date)">
            <div class="day-name" :class="{ selected: isSelected(day.date) }">{{ day.shortDay }}</div>
            <div class="day-number" :class="{ selected: isSelected(day.date) }">{{ day.day }}</div>
        </div>
    </div>
</div>
</template>

<script setup>
import {
    ref,
    computed,
    watch,
	onMounted
} from 'vue'

const props = defineProps({
    modelValue: String, // YYYY-MM-DD
})
const emit = defineEmits(['update:modelValue'])

const today = new Date()

// Helper: format date thành YYYY-MM-DD (local)
function toLocalISODate(d) {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Helper: đầu tuần (Chủ Nhật)
function startOfWeek(date) {
    const d = new Date(date)
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
}

// Lấy 7 ngày từ đầu tuần
function getWeekDays(startDate) {
    const days = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate)
        d.setDate(d.getDate() + i)
        days.push({
            date: toLocalISODate(d), // YYYY-MM-DD local
            day: d.getDate(),
            shortDay: d.toLocaleDateString(undefined, {
                weekday: 'short'
            }), // ngôn ngữ theo browser
        })
    }
    return days
}

const weeks = ref([])
const currentWeekIndex = ref(0)

function initWeeks() {
    const firstWeekStart = startOfWeek(today)
    const secondWeekStart = new Date(firstWeekStart)
    secondWeekStart.setDate(secondWeekStart.getDate() + 7)
    weeks.value = [getWeekDays(firstWeekStart), getWeekDays(secondWeekStart)]
}
initWeeks()

// Label hiển thị khoảng tuần
const weekRangeLabel = computed(() => {
    const week = weeks.value[currentWeekIndex.value]
    if (!week) return ''
    const start = new Date(week[0].date)
    const end = new Date(week[6].date)
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
})

function prevWeek() {
    if (currentWeekIndex.value > 0) currentWeekIndex.value--
}

function nextWeek() {
    if (currentWeekIndex.value < weeks.value.length - 1) currentWeekIndex.value++
}

const selectedDate = ref(props.modelValue || '')

function selectDate(date) {
    selectedDate.value = date
    emit('update:modelValue', date) // YYYY-MM-DD
}

function isSelected(date) {
    return selectedDate.value === date
}

function isToday(date) {
    return date === toLocalISODate(today)
}

function isPastDate(date) {
    const dateObj = new Date(date)
    const todayObj = new Date(today)
    todayObj.setHours(0, 0, 0, 0)
    dateObj.setHours(0, 0, 0, 0)
    return dateObj < todayObj
}

watch(
    () => props.modelValue,
    (val) => {
        selectedDate.value = val
    }
)

// onMounted(() => {
// 	initWeeks()
// })
</script>

<style scoped>
.date-picker {
    display: grid;
    gap: 2rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
}

.date-picker::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 700;
    font-size: var(--font-size-base);
    color: #1f2937;
    position: relative;
    z-index: 1;
}

.header span {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
}

.header button {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    width: 44px;
    height: 44px;
    font-size: var(--font-size-base);
    font-weight: 700;
    cursor: pointer;
    color: #374151;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header button:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-color: var(--color-primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(7, 27, 102, 0.2);
}

.header button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f3f4f6;
    border-color: #e5e7eb;
    color: #9ca3af;
}

.days {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
}

.day {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 60px;
    cursor: pointer;
    border-radius: 16px;
    padding: 0.75rem 0.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%);
    border: 1px solid rgba(226, 232, 240, 0.6);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.day:hover:not(.disabled) {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.05) 0%, rgba(7, 27, 102, 0.02) 100%);
    border-color: var(--color-primary-light);
    box-shadow: 0 4px 8px rgba(7, 27, 102, 0.1);
}

.day-name {
    font-size: var(--font-size-small);
    color: #6b7280;
    margin-bottom: 0.25rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.3s ease;
    text-align: center;
}

.day-name.selected {
    color: var(--color-primary);
}

.day-number {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: #374151;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
    border: 1px solid transparent;
}

.day.selected {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(7, 27, 102, 0.25);
}

.day.selected .day-name {
    color: white;
}

.day.selected .day-number {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
}

.day.today:not(.selected) .day-number {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.1) 0%, rgba(7, 27, 102, 0.05) 100%);
    color: var(--color-primary);
    font-weight: 800;
}

.day.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f3f4f6;
    border-color: #e5e7eb;
}

.day.disabled .day-number {
    color: #9ca3af;
    background: rgba(243, 244, 246, 0.5);
}

.day.disabled .day-name {
    color: #9ca3af;
}

@media (max-width: 868px) {
    .header {
        font-size: var(--font-size-base);
    }

    .day-number {
        font-size: var(--font-size-small);
    }
}
</style>
