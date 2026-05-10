import { ref } from 'vue';

export const isWebcamVisible = ref<boolean>(true);

export function toggleWebcam(): void {
    isWebcamVisible.value = !isWebcamVisible.value;
}

export function setWebcamVisible(value: boolean): void {
    isWebcamVisible.value = value;
}
