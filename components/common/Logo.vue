<template>
    <div class="logo" @click="redirect('/')">
        <!-- <img src="/images/logo.webp" alt="TutorFind" class="logo-image"></img> -->
        <span class="logo-text">TutorFind</span>
    </div>
</template>

<script setup>
	const router = useRouter()

	const redirect = ((path) => {
		router.push(path)
	})
</script>

<style scoped>
@import url(~/assets/css/logo.css);
</style>
