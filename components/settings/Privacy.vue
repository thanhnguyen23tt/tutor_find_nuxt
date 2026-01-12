<script setup>
</script>

<template>
    <section class="settings-content">
        <div class="content-header">
            <h2 class="section-title">Quyền riêng tư</h2>
        </div>

        <div class="info-list">
            <div class="info-item">
                <div class="info-main">
                    <div class="info-label">Chia sẻ dữ liệu</div>
                    <div class="info-value">Quản lý cách dữ liệu của bạn được chia sẻ với người khác.</div>
                </div>
                <div class="info-action">
                    <button class="btn-link">Quản lý</button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.settings-content {
    padding-top: 8px;
}

.content-header {
    margin-bottom: 24px;
}

.section-title {
    font-size: 24px;
    font-weight: 600;
    color: #222;
    margin: 0;
}

.info-list {
    display: flex;
    flex-direction: column;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 0;
    border-bottom: 1px solid #ebebeb;
}

.info-item:first-child {
    padding-top: 0;
}

.info-main {
    flex: 1;
    padding-right: 24px;
}

.info-label {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #222;
    margin-bottom: 4px;
}

.info-value {
    font-size: 14px;
    color: #717171;
}

.info-action {
    flex-shrink: 0;
}

.btn-link {
    background: none;
    border: none;
    color: #222;
    font-size: 14px;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
}

.btn-link:hover {
    color: #717171;
}
</style>
