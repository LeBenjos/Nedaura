<script setup lang="ts">
import gsap from 'gsap';
import { onMounted } from 'vue';

onMounted(() => {
    const onJaugeUpdate = (e: Event): void => {
        const percentage = (e as CustomEvent).detail.percentage;
        const jaugeFill = document.getElementById('jaugeFill');
        if (jaugeFill) {
            gsap.to(jaugeFill, {
                height: `${percentage * 100}%`,
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    };

    window.addEventListener('jauge:update', onJaugeUpdate);

    return () => {
        window.removeEventListener('jauge:update', onJaugeUpdate);
    };
});

</script>

<template>
    <transition name="interactionWind">
        <div class="jauge" id="jauge">
            <!-- une jauge sur le côté droit de l'écran, a l'horizontal, qui se remplit de bas en haut -->
            <div class="jauge-fill" id="jaugeFill"></div>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
.jauge {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 400px;
    border: 2px solid white;
    border-radius: 15px;
    overflow: hidden;
    z-index: 9999;
    background: radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.1) 100%);
    background-blend-mode: hard-light;
    box-shadow: 0 0 8px 0 #fff;

    .jauge-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background-color: white;
        transition: height 0.3s ease;
    }
}
</style>
