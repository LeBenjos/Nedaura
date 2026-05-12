<script setup lang="ts">
import gsap from 'gsap';
import { onMounted } from 'vue';

import { SoundId } from '@/constants/experiences/Sound/SoundId';
import { useInterfaceManager } from '@/hooks/useInterfaceManager';
import SoundManager from '@/managers/SoundManager';
import ButtonComponent from '../../components/ButtonComponent.vue';
import IntroView from '../Intro/IntroView.vue';
import LogoNedaura from './LogoNedaura.vue';

const { mount, unmount } = useInterfaceManager();

onMounted(() => {
    SoundManager.playAmbientSound(SoundId.MENU_MUSIC, 800, 0.5);
    SoundManager.playAmbientSound(SoundId.MENU_AMBIANCE, 800, 0.5);
});

const onClick = (): void => {
    gsap.to('.menu-container', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',

        onComplete: () => {
            unmount('menu');
            mount({ id: 'intro', component: IntroView, noAnimation: true });
        },
    });
};
</script>

<template>
    <transition name="menu">
        <div class="background">
            <div class="menu-container">
                <div class="menu-logo">
                    <LogoNedaura />
                </div>

                <div class="menu-button" @click="onClick">
                    <ButtonComponent label="Commencer" :is-icon="true" />
                </div>
            </div>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
/* CONTAINER */
.background {
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

    .menu-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
}
</style>
