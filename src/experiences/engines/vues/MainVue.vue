<script setup lang="ts">
import MediapipeView from '../../views/mediapipe/MediapipeView.vue';
import IntroView from '../../views/vues/Intro/IntroView.vue';
import LoaderView from '../../views/vues/LoaderView.vue';
import LoaderManager from '../../managers/LoaderManager';
import { onMounted, ref } from 'vue';

const isVisible = ref(false);

onMounted(() => {
    LoaderManager.onHide.add(onShow);
});

const onShow = (): void => {
    isVisible.value = true;
};

</script>

<template>
    <div id="loader">
        <LoaderView />
    </div>
    <div v-if="isVisible">
        <IntroView />
    </div>
    <div class="mediapipe-container">
        <MediapipeView />
    </div>
</template>
