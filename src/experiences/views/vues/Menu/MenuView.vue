<script setup lang="ts">
import gsap from 'gsap';
import { onMounted } from 'vue';

import LogoNedaura from './LogoNedaura.vue';
import IntroView from '../Intro/IntroView.vue';
import { useInterfaceManager } from '../hooks/useInterfaceManager';
import SoundManager from '../../../managers/SoundManager';
import { SoundId } from '../../../constants/experiences/Sound/SoundId';

const { mount, unmount } = useInterfaceManager();

onMounted(() => {
    SoundManager.playAmbientSound(SoundId.MENU_MUSIC);
    SoundManager.playAmbientSound(SoundId.MENU_AMBIANCE);
});


const onClick = (): void => {
    gsap.to('.menu-container', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',

        onComplete: () => {
            SoundManager.stopAmbientSound(SoundId.MENU_MUSIC);
            SoundManager.stopAmbientSound(SoundId.MENU_AMBIANCE);
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
                    <p>Commencer</p>
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

        .menu-button {
            position: relative;
            overflow: hidden;
            cursor: pointer;
            width: fit-content;

            display: flex;
            padding: 8px 32px;
            justify-content: center;
            align-items: center;
            gap: 10px;

            border-radius: 80px;
            border: 2px solid #fff;
            background: radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.22) 0%, rgba(153, 153, 153, 0.34) 100%);
            background-blend-mode: hard-light;
            box-shadow: 0 0 8px 0 #fff;
            transition: all 0.3s ease-in-out;

            &:hover {
                background-blend-mode: hard-light;
                box-shadow: 0 0 6px 2px #fff;
            }

            p {
                color: #fff;
                text-align: center;
                font-size: 16px;
                line-height: 36px;
                position: relative;
                z-index: 1;
            }
        }
    }
}
</style>
