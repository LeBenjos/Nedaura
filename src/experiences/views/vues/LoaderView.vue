<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import LoaderManager from '../../managers/LoaderManager';

const isVisible = ref(false);
const isEnded = ref(false);
const loadingNumber = ref(0);
const barScaleX = ref(0);

const barStyle = computed(() =>
    isEnded.value ? undefined : { transform: `translateY(-50%) scaleX(${barScaleX.value})` }
);

const onShow = (): void => {
    loadingNumber.value = 0;
    barScaleX.value = 0;
    isEnded.value = false;
    isVisible.value = true;
};

const onProgress = (): void => {
    const progress = LoaderManager.progress * 100;
    barScaleX.value = LoaderManager.progress;
    loadingNumber.value = Math.round(progress);
};

const onHide = (): void => {
    loadingNumber.value = 100;
    barScaleX.value = 1;
    isEnded.value = true;
    isVisible.value = false;
};

onMounted(() => {
    LoaderManager.onShow.add(onShow);
    LoaderManager.onProgress.add(onProgress);
    LoaderManager.onHide.add(onHide);
});

onUnmounted(() => {
    LoaderManager.onShow.remove(onShow);
    LoaderManager.onProgress.remove(onProgress);
    LoaderManager.onHide.remove(onHide);
});
</script>

<template>
    <div id="loading-screen" class="html-view loading-screen" :class="{ show: isVisible }">
        <div class="loading-progress">
            <span class="loading-number">{{ loadingNumber }}</span>
            <span>%</span>
        </div>
        <div class="loading-bar" :class="{ ended: isEnded }" :style="barStyle"></div>
    </div>
</template>
