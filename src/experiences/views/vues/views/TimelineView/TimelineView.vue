<script lang="ts" setup>
import Timeline from './components/Timeline';

const props = withDefaults(
    defineProps<{
        duration?: number;
        initialValue: number;
        endValue: number;
    }>(),
    {
        duration: 900,
    }
);
</script>

<template>
    <div class="timeline-view">
        <Timeline :duration="duration" :initialValue="initialValue" :endValue="endValue" />
    </div>
</template>

<style lang="scss" scoped>
.timeline-view {
    width: 30%;
    height: auto;
}
</style>
