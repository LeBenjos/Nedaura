<script setup lang="ts">
defineProps<{
    value: number;
}>();
</script>

<template>
    <div class="loading-progress">
        <span class="loading-number">{{ value }}</span>
        <span>%</span>
    </div>
</template>
