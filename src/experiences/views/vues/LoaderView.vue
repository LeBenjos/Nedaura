<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import LoaderManager from '../../managers/LoaderManager';

const isVisible = ref(false);
const isEnded = ref(false);
const loadingNumber = ref(0);
const barScaleX = ref(0);

const SVG_W = 207;
const SVG_H = 203;
const clipId = `loaderFillClip-${Math.random().toString(36).slice(2)}`;

const progress01 = computed(() => {
    const p = barScaleX.value;
    return Math.max(0, Math.min(1, p));
});

const fillRect = computed(() => {
    const h = SVG_H * progress01.value;
    return {
        x: 0,
        y: SVG_H - h,
        width: SVG_W,
        height: h,
    };
});

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
        <div class="loading-bar" :class="{ ended: isEnded }">
            <svg :width="SVG_W" :height="SVG_H" viewBox="0 0 207 203" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <clipPath :id="clipId">
                        <rect
                            :x="fillRect.x"
                            :y="fillRect.y"
                            :width="fillRect.width"
                            :height="fillRect.height"
                        />
                    </clipPath>
                </defs>

                <g :clip-path="`url(#${clipId})`">
                    <path
                        d="M96.11 1.25L81.32 96.9243L26.75 87.764L65.51 126.441L1.25 187.51L81.32 160.538L96.11 201.25L114.47 160.538L205.25 187.51L131.3 126.441L164.96 87.764L114.47 96.9243L96.11 1.25Z"
                        fill="white"
                    />
                </g>

                <path
                    d="M96.11 1.25L81.32 96.9243L26.75 87.764L65.51 126.441L1.25 187.51L81.32 160.538L96.11 201.25L114.47 160.538L205.25 187.51L131.3 126.441L164.96 87.764L114.47 96.9243L96.11 1.25Z"
                    stroke="white"
                    stroke-width="2.5"
                    stroke-linejoin="round"
                />
            </svg>
        </div>
    </div>
</template>
