<script lang="ts" setup>
interface LineProps {
    totalLines: number;
    lineGap: number;
    lineHeight: number;
}

const props = defineProps<LineProps>();
</script>

<template>
    <div class="lines-container" :style="{ gap: props.lineGap + 'px' }">
        <div
            v-for="n in totalLines"
            :key="n"
            :class="['line', n % 5 === 0 ? 'major' : 'minor']"
            :style="{ height: props.lineHeight + 'px' }"
        ></div>
    </div>
</template>

<style lang="scss" scoped>
.lines-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.line {
    width: 100%;
    background-color: white;

    &.major {
        width: calc(100% - 5px);
    }

    &.minor {
        width: 60%;
    }
}
</style>
