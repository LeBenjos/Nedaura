<script lang="ts" setup>
import { computed } from 'vue';

// Define the interface for our component props
interface Props {
    year?: number;
    era?: string;
}

// Set up props with default values matching your image
const props = withDefaults(defineProps<Props>(), {
    year: -3600,
    era: 'av. JC',
});

// Computed property to handle the formatting logic
const formattedDate = computed(() => {
    // You can add more complex logic here later (like localization, absolute values, etc.)
    return `${props.year} ${props.era}`;
});
</script>

<template>
    <p class="date">[{{ formattedDate }}]</p>
</template>

<style lang="scss" scoped>
.date {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    letter-spacing: 0.02em;

    text-shadow:
        0 0 10px rgba(255, 255, 255, 0.9),
        0 0 20px rgba(255, 255, 255, 0.6),
        0 0 35px rgba(255, 255, 255, 0.3);
}
</style>
