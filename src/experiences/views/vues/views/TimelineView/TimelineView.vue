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
    position: absolute;
    top: 0;
    left: 40px;
    width: 30%;
    height: 100vh;
    pointer-events: none;

    mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 30%,
        black 70%,
        transparent 100%
    );
    -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 30%,
        black 70%,
        transparent 100%
    );
}
</style>
