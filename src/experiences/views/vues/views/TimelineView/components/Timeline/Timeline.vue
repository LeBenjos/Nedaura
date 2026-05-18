<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { lerp, mod } from '@/experiences/views/vues/utils';

import Date from '../Date';

// Odd number guarantees exactly one line at center
const totalLines = 40;
const lineHeight = 2;
const centerIndex = Math.floor(totalLines / 2); // 20
const centerY = window.innerHeight / 2;

const stepSize = computed(() => (window.innerHeight - lineHeight * totalLines) / totalLines + lineHeight + 1);

const totalSpan = computed(() => totalLines * stepSize.value);

const targetYears = [-3600, -2000, -500, 0, 1492, 2026];
let currentYearIndex = 0;

// Scroll state — only one value drives everything
let rawOffset = 0;
let targetOffset = 0;
const lerpedOffset = ref(0);

let rawYear = targetYears[currentYearIndex];
let targetYear = targetYears[currentYearIndex];
const lerpedYear = ref(rawYear); // This is what we pass to the template

let raf: number | null = null;

const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'g') return;

    currentYearIndex = (currentYearIndex + 1) % targetYears.length;
    targetYear = targetYears[currentYearIndex];

    targetOffset += 30 * stepSize.value;
    if (!raf) raf = requestAnimationFrame(animate);
};

/* const animate = () => {
    if (Math.abs(targetOffset - rawOffset) < 0.1) {
        rawOffset = targetOffset;
        lerpedOffset.value = rawOffset;
        cancelAnimationFrame(raf!);
        raf = null;
        return;
    }
    rawOffset = lerp(rawOffset, targetOffset, 0.02);
    lerpedOffset.value = rawOffset;
    raf = requestAnimationFrame(animate);
}; */

const animate = () => {
    const offsetDiff = Math.abs(targetOffset - rawOffset);

    // If BOTH animations are close enough to their targets, snap and stop
    if (offsetDiff < 0.1) {
        rawOffset = targetOffset;
        lerpedOffset.value = rawOffset;

        cancelAnimationFrame(raf!);
        raf = null;
        return;
    }

    // Lerp timeline offset
    rawOffset = lerp(rawOffset, targetOffset, 0.06);
    lerpedOffset.value = rawOffset;

    // Lerp the year (using the exact same 0.02 factor ensures perfectly synced timing)
    rawYear = lerp(rawYear, targetYear, 0.06);
    // Math.round ensures the counter only shows whole numbers as it counts up/down
    lerpedYear.value = Math.round(rawYear);

    raf = requestAnimationFrame(animate);
};

onMounted(() => window.addEventListener('keydown', onKeyDown));
onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
    if (raf) cancelAnimationFrame(raf!);
});

// Where line i should appear on screen, with modular wrapping
const getY = (i: number): number => {
    const half = totalSpan.value / 2;
    const raw = (i - centerIndex) * stepSize.value - lerpedOffset.value;
    return centerY + mod(raw + half, totalSpan.value) - half;
};

// How many full steps we've scrolled (integer) — used to derive tick identity
const scrollSteps = computed(() => Math.round(lerpedOffset.value / stepSize.value));

// Which tick this line currently represents (survives wrapping)
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

    /*  // The fixed crosshair line
    &:before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: calc(100% - 5px);
        height: 2px;
        background-color: white;
        transform: translateY(-50%);
        box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.7);
        z-index: 2;
        pointer-events: none;
    }

    &:after {
        content: '';
        position: absolute;
        top: 50%;
        right: 5px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: white;
        transform: translateY(-50%);
        box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.7);
        z-index: 2;
        pointer-events: none;
    } */
}

.date-container {
    content: '';
    position: absolute;
    top: 50%;
    left: 8%;
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
