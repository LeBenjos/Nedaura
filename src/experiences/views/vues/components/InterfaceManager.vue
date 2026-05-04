<template>
    <!-- Hold all mounted ui components, mounts and unmounts them -->
    <div class="container">
        <TransitionGroup name="item" appear>
            <component v-for="{ id, component, props } in stack" :key="id" :is="component" v-bind="props" />
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { useInterfaceManager } from '../hooks/useInterfaceManager';

const { stack } = useInterfaceManager();
</script>

<style scoped>
.container {
    position: fixed;
    width: 100%;
    height: 100vh;
    inset: 0;
    z-index: 10;
}

.item-enter-active,
.item-leave-active {
    transition: opacity 0.5s ease;
}

.item-enter-from,
.item-leave-to {
    opacity: 0;
}
</style>
