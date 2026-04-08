<script setup lang="ts">
import MediapipeView from '../../views/mediapipe/MediapipeView.vue';
import LoaderView from '../../views/vues/LoaderView.vue';
</script>

<template>
    <div id="loader">
        <LoaderView />
    </div>
    <div class="mediapipe-container">
        <MediapipeView />
    </div>
</template>
