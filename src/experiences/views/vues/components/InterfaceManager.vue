<template>
    <div class="container">
        <div v-for="{ id, component, noAnimation, props } in stack" :key="id">
            <Transition :name="noAnimation ? '' : 'item'" appear>
                <component :is="component" v-bind="props" />
            </Transition>
        </div>
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
