<script setup lang="ts">

</script>

<template>
    <button id="webcamButton" class="mdc-button mdc-button--raised">
        <span class="mdc-button__ripple"></span>
        <span class="mdc-button__label">ENABLE WEBCAM</span>
    </button>
    <div class="webcam-container">
        <video id="webcam" class="webcam" autoplay playsinline></video>
        <canvas class="output_canvas" id="output_canvas"></canvas>
    </div>
</template>

<style lang="scss" scoped>
/* WEBCAM CONTAINER */
.webcam-container {
    position: absolute;
    bottom: 50px;
    left: 50px;
    width: 320px;
    aspect-ratio: 4 / 3;
    overflow: hidden;
}

/* VIDEO + CANVAS SUPERPOSÉS */
.webcam,
.output_canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

.webcam {
    object-fit: contain;
}

.output_canvas {
    pointer-events: none;
}

/* BUTTON */
.webcamButton {
    position: absolute;
    top: 10px;
    left: px;
    transform: translate(-50%, -50%);
    z-index: 10;
    padding: 12px 20px;
    font-size: 16px;
    cursor: pointer;
}
</style>
