<template>
    <base-modal v-if="isOpen" :isOpen="isOpen" @close="closeModal" size="small" title="Gửi tin nhắn">
        <div class="send-message">
            <div class="user-info">
                <img :src="user?.avatar" class="avatar">
                <div class="user-details">
                    <h4 class="name">Liên hệ {{ user?.full_name || 'User' }}</h4>
                    <span class="desc">Giới thiệu bản thân với {{ user?.full_name }}, chia sẻ vấn đề của bạn và đặt bất kỳ câu hỏi nào</span>
                </div>
            </div>

            <div class="message-form">
                <base-input type="textarea" v-model="message" placeholder="Viết tin nhắn của bạn ở đây…"></base-input>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="closeModal">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button class="btn-md btn-primary" @click="sendMessage" :disabled="!message.trim()">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                    <span>Gửi tin nhắn</span>
                </button>
            </div>
        </div>
    </base-modal>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    user: {
        type: Object,
        required: true
    },
    isOpen: {
        type: Boolean,
        default: false
    }
})

console.log(props.user);

const emit = defineEmits(['messageSent', 'close']);

const { api } = useApi();
const { success, error: notifyError } = useNotification();

const message = ref('');

watch(
    () => props.user,
    (user) => {
        const name = user?.full_name || 'User';
        message.value = `Xin chào ${name}`;
    },
    { immediate: true }
);

const closeModal = () => {
    emit('close');
};

const sendMessage = async () => {
    if (!message.value.trim()) return;

    try {
        const response = await api.apiPost('send-message', {
            receiver_id: props.user.uid,
            content: message.value
        });

        if (response.success) {
            success('Tin nhắn đã được gửi thành công!');
            emit('messageSent', response.message);
            closeModal();
        } else {
            notifyError('Có lỗi xảy ra khi gửi tin nhắn!');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        notifyError('Có lỗi xảy ra khi gửi tin nhắn!');
    }
}
</script>

<style scoped>
.send-message {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    border-left: 4px solid var(--color-primary);
}

.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.user-details {
    flex: 1;
    text-align: left;
}

.name {
    font-size: var(--font-size-base);
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #1f2937;
}

.desc {
    font-size: var(--font-size-small);
    color: var(--gray-600);
    line-height: 1.4;
    margin: 0;
    display: block;
}

.message-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

@media (max-width: 768px) {
    .user-info {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }

    .user-details {
        text-align: center;
    }
}
</style>
