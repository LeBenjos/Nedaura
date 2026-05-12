<script setup lang="ts">
import gsap from 'gsap';
import { onMounted, ref } from 'vue';

defineProps({
    label: String,
    isIcon: Boolean,
})

const buttonRef = ref<HTMLButtonElement | null>(null);
const iconRef = ref<HTMLSpanElement | null>(null);

onMounted(() => {
    if (!buttonRef.value || !iconRef.value) return;

    // État initial : icône invisible et sans largeur
    gsap.set(iconRef.value, { width: 0, opacity: 0, overflow: 'hidden' });

    buttonRef.value.addEventListener('mouseenter', () => {
        gsap.killTweensOf(iconRef.value);
        gsap.to(iconRef.value, {
            width: 20,
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
        });
    });

    buttonRef.value.addEventListener('mouseleave', () => {
        gsap.killTweensOf(iconRef.value);
        gsap.to(iconRef.value, {
            width: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
        });
    });
});
</script>

<template>
    <div class="button-wrapper">
        <button ref="buttonRef" class="button">
            <span class="text">{{ label }}</span>
            <span ref="iconRef" class="icon" v-if="isIcon">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.244697 1.45764C-0.081665 1.14294 -0.081542 0.620182 0.244968 0.30563L0.329841 0.223865C0.639739 -0.0746832 1.13028 -0.0746107 1.44009 0.22403L7.62721 6.18812C7.73589 6.29226 7.82214 6.41609 7.881 6.5525C7.93985 6.68891 7.97015 6.83519 7.97015 6.98293C7.97015 7.13067 7.93985 7.27696 7.881 7.41336C7.82214 7.54977 7.73589 7.6736 7.62721 7.77774L1.44035 13.7447C1.13046 14.0436 0.639607 14.0436 0.329688 13.7447L0.245526 13.6636C-0.0807085 13.349 -0.0807323 12.8265 0.245473 12.5119L5.37928 7.5605C5.70549 7.24588 5.70546 6.72338 5.37923 6.4088L0.244697 1.45764Z" fill="white"/>
                </svg>
            </span>
        </button>
    </div>

</template>

<style scoped>

.button-wrapper {
    position: relative;
    border-radius: 45px;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 45px;
        padding: 1px;
        background: linear-gradient(330deg, rgba(251, 251, 251, 1), rgba(90, 40, 42, 1), rgba(227, 227, 227, 1), rgba(59, 19, 21, 1));
        -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }

    .button {
        display: inline-flex;
        padding: 8px 32px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        border: 1px solid transparent;
        border-radius: 100px;
        background: rgba(241, 241, 241, 0.27);
        cursor: pointer;
        
        transition: box-shadow 0.3s ease;
        
        &:hover {
            box-shadow: 0 -9px 8.4px 0 rgba(255, 255, 255, 0.34) inset, 0 9px 8.4px 0 rgba(255, 255, 255, 0.34) inset;
        }
    
        .text {
            line-height: 36px;
            color: var(--Blanc, #FFF);
            text-align: center;
            font-family: "Montserrat Alternates";
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
        }
    
        .icon {
            color: #FFF;
            font-size: 20px;
            line-height: 1;
            display: inline-block;
            /* width et opacity gérés par GSAP */
        }
    }
}
</style>