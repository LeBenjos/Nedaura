<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    scaleX: number;
    ended: boolean;
}>();

const style = computed(() =>
    props.ended ? undefined : { transform: `translateY(-50%) scaleX(${props.scaleX})` }
);
</script>

<template>
    <div class="loading-bar" :class="{ ended }" :style="style"></div>
</template>
