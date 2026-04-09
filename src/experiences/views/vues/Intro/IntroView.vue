<script setup lang="ts">
import LogoNedaura from './LogoNedaura.vue';
import { ref } from 'vue';

const isVisible = ref(true);

const onClick = (): void => {
    isVisible.value = false;
};
</script>

<template>
    <transition name="intro">
        <div class="intro-container" v-if="isVisible">
            <div class="intro-logo">    
                <LogoNedaura />
            </div>

            <div class="intro-button" id="webcamButton" @click="onClick">
                <p>Commencer l'expérience</p>
            </div>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
/* CONTAINER */
.intro-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;

    z-index: 101;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; 
    gap: 23px;

    background-color: rgba(16, 6, 1, 0.7);
    backdrop-filter: blur(4px);
}

/* BUTTON */
.intro-button {
    position: relative;
    overflow: hidden;
    cursor: pointer;

    display: flex;
    padding: 8px 32px;
    justify-content: center;
    align-items: center;
    gap: 10px;

    border-radius: 80px;
    border: 2px solid #FFF;
    background: radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.22) 0%, rgba(153, 153, 153, 0.34) 100%);
    background-blend-mode: hard-light;
    box-shadow: 0 0 8px 0 #FFF;
    transition: all 0.3s ease-in-out;

    &:hover {
        background-blend-mode: hard-light;
        box-shadow: 0 0 6px 2px #FFF;
    }

    p {
        color: #FFF;
        text-align: center;
        font-size: 16px;
        line-height: 36px;
        position: relative;
        z-index: 1;
    }
}

/* TRANSITIONS */

.intro-enter-active,
.intro-leave-active {
    transition: all 0.9s ease-in-out;
}

/* état initial entrée */
.intro-enter-from {
    opacity: 0;
    backdrop-filter: blur(0px);
}

/* état final sortie */
.intro-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);
}

/* état normal */
.intro-enter-to,
.intro-leave-from {
    opacity: 1;
    backdrop-filter: blur(4px);
}

/* LOGO ANIMATION */

.intro-logo {
    transition: all 0.9s ease-in-out;
}

.intro-enter-from .intro-logo {
    opacity: 0;
}

.intro-leave-to .intro-logo {
    opacity: 0;
}

/* BUTTON ANIMATION */

.intro-button {
    transition: all 0.9s ease-in-out;
    transition-delay: 0.1s;
}

.intro-enter-from .intro-button {
    opacity: 0;
}

.intro-leave-to .intro-button {
    opacity: 0;
}
</style>