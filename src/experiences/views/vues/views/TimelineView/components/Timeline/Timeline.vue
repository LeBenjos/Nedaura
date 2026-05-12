<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { mod } from '@/experiences/views/vues/utils';
import Date from '../Date';

// ─── Props ────────────────────────────────────────────────────────────────────
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

// ─── Config ───────────────────────────────────────────────────────────────────
const totalLines = 40;
const lineHeight = 2;
const centerIndex = Math.floor(totalLines / 2);
const centerY = window.innerHeight / 2;

const stepSize = computed(() => (window.innerHeight - lineHeight * totalLines) / totalLines + lineHeight + 1);
const totalSpan = computed(() => totalLines * stepSize.value);

// ─── Easing ───────────────────────────────────────────────────────────────────
const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ─── Animation state ──────────────────────────────────────────────────────────
let startOffset = 0;
let currentOffset = 0;
let targetOffset = 30 * stepSize.value; // une transition = 30 steps

let startYear = props.initialValue;
let currentYear = props.initialValue;
let targetYear = props.endValue;

const lerpedOffset = ref(0);
const lerpedYear = ref(props.initialValue);

let animStartTime: number | null = null;
let raf: number | null = null;

// ─── Animation loop ───────────────────────────────────────────────────────────
const animate = (now: number) => {
    if (animStartTime === null) animStartTime = now;

    const elapsed = now - animStartTime;
    const t = Math.min(elapsed / props.duration, 1);
    const eased = easeInOutCubic(t);

    currentOffset = startOffset + (targetOffset - startOffset) * eased;
    currentYear = startYear + (targetYear - startYear) * eased;

    lerpedOffset.value = currentOffset;
    lerpedYear.value = Math.round(currentYear);

    if (t < 1) {
        raf = requestAnimationFrame(animate);
    } else {
        currentOffset = targetOffset;
        currentYear = targetYear;
        lerpedOffset.value = targetOffset;
        lerpedYear.value = Math.round(targetYear);
        raf = null;
    }
};

// ─── Lifecycle — lance l'anim au mount ───────────────────────────────────────
onMounted(() => {
    raf = requestAnimationFrame(animate);
});

onUnmounted(() => {
    if (raf) cancelAnimationFrame(raf);
});

// ─── Geometry ─────────────────────────────────────────────────────────────────
const getY = (i: number): number => {
    const half = totalSpan.value / 2;
    const raw = (i - centerIndex) * stepSize.value - lerpedOffset.value;
    return centerY + mod(raw + half, totalSpan.value) - half;
};

const scrollSteps = computed(() => Math.round(lerpedOffset.value / stepSize.value));

const getTick = (i: number): number => {
    const slot = Math.round((getY(i) - centerY) / stepSize.value);
    return mod(centerIndex + scrollSteps.value + slot, totalLines);
};

const isSelected = (i: number) => Math.abs(getY(i) - centerY) < stepSize.value / 2;
const isMajor = (i: number) => getTick(i) % 5 === 0;
</script>

<template>
    <div class="timeline-container">
        <div
            v-for="i in totalLines"
            :key="i"
            class="line"
            :class="{
                major: isMajor(i - 1),
                minor: !isMajor(i - 1),
                selected: isSelected(i - 1),
            }"
            :style="{
                top: `${getY(i - 1)}px`,
                height: `${lineHeight}px`,
            }"
        />
    </div>
    <div class="date-container">
        <Date :year="lerpedYear" era="av. JC" />
    </div>
</template>

<style lang="scss" scoped>
.timeline-container {
    position: relative;
    width: 20%;
    height: 100vh;
    overflow: hidden;

    mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 20%,
        black 52%,
        rgba(0, 0, 0, 0.3) 52%,
        rgba(0, 0, 0, 0.3) 80%,
        transparent 100%
    );
    -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 20%,
        black 52%,
        rgba(0, 0, 0, 0.3) 52%,
        rgba(0, 0, 0, 0.3) 80%,
        transparent 100%
    );
}

.date-container {
    content: '';
    position: absolute;
    top: 50%;
    left: 25%;
    transform: translate(0, -50%);
}

.line {
    position: absolute;
    left: 0;
    background-color: white;
    transform: translateY(-50%);
    box-shadow: 0;
    transition: box-shadow 0.1s ease;

    &.minor {
        width: 60%;
        opacity: 0.6;
    }

    &.major {
        width: calc(100% - 5px);
        opacity: 0.8;
    }

    &.selected {
        width: calc(100% - 5px);
        box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.7);

        &:after {
            content: '';
            position: absolute;
            top: 50%;
            right: 0;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: white;
            transform: translateY(-50%);
            box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.7);
        }
        //opacity: 0; // hidden — the :before crosshair covers this position
    }
}
</style>
