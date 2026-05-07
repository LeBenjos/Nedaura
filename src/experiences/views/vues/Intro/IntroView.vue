<script setup lang="ts">
import { useInterfaceManager } from '../hooks/useInterfaceManager';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { TimelineExperienceState } from '../../../constants/experiences/TimelineExperienceState';
import TimelineExperienceManager from '../../../managers/TimelineExperienceManager';
import { transition } from 'three/examples/jsm/tsl/display/TransitionNode.js';
import TextManager from '../../../managers/TextManager/TextManager';
import { TextId } from '../../../constants/experiences/TextId';
import gsap from 'gsap';
import MainMediapipe from '../../../engines/mediapipe/MainMediapipe';
import { MediapipeHandsSnapshot } from '../../../managers/MediapipeManager';
import { playTextSequence } from '../../../managers/TextManager/TextSequence';
import DebugManager from '../../../managers/DebugManager';

const showInstruction = ref(true);
const startExperience: boolean = false;

const { mount, unmount } = useInterfaceManager();
const controller = new AbortController();

const isDebug = ref<boolean>(DebugManager.isActive);
const isDebugVisible = ref<boolean>(DebugManager.isVisible);

onMounted(() => {
    gsap.to('.intro-container', {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut',
    });
});

const onClick = () => {
    const tl = gsap.timeline();
    
    tl.to('#webcamButton', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
    });

    tl.to('#instruction', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
            showInstruction.value = false;
            window.addEventListener('hand:update', _onHandUpdate as EventListener);
        },
    });
};

const _onHandUpdate = (e: CustomEvent<MediapipeHandsSnapshot>) => {
    const leftHand = e.detail.left;
    const leftFist = leftHand?.isFist ? leftHand.fist : undefined;
    const rightFist = e.detail.right?.isFist ? e.detail.right.fist : undefined;
    if (leftFist && rightFist) {
        if (!showInstruction.value ) {
            console.log("Hand update received:", { leftFist, rightFist });
            showInstruction.value = true;
            window.removeEventListener('hand:update', _onHandUpdate);
            onStartExperience();
        }
    }
}

const onStartExperience = async () => {
    console.log("Starting experience...");
    gsap.to('.intro-container', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
    });

    if (true) {
        await playTextSequence(
            [
                {
                    id: TextId.INTRO_1,
                    displayDuration: 2000,
                    // options: { duration: 1.2, hideDuration: 0.8 },
                },
                {
                    id: TextId.INTRO_2,
                    displayDuration: 3500,
                },
                {
                    id: TextId.INTRO_3,
                    displayDuration: 3500,
                },
                {
                    id: TextId.INTRO_4,
                    displayDuration: 3500,
                },
                {
                    id: TextId.INTRO_5,
                    displayDuration: 3500,
                },
                {
                    id: TextId.INTRO_6,
                    displayDuration: 3500,
                },
                {
                    id: TextId.INTRO_7,
                    displayDuration: 3500,
                },
            ],
            { signal: controller.signal }
        );
    }

    unmount('intro');
    TimelineExperienceManager.setState(TimelineExperienceState.PATH_INTRO);

    console.log("Séquence terminée");
};

onBeforeUnmount(() => {
    controller.abort();
    window.removeEventListener('hand:update', _onHandUpdate);
});


</script>

<template>
    <transition name="intro">
        <div class="intro-background">
            <div class="intro-container">
                <div class="intro-text">
                    <p>Cette expérience se repose sur la reconnaissance des gestes par la caméra. Vous pourrez vous déplacer et interagir avec les éléments du site en utilisant simplement vos mains.</p>
                    <p id="instruction" v-if="showInstruction">
                        Veuillez autoriser l'utilisation de la caméra sur ce site.
                    </p>
                    <p v-if="!showInstruction" id="ready-instruction" class="ready">
                        Quand vous êtes prêt, fermez les deux poings.
                    </p>
                </div>
                <button class="button" id="webcamButton" @click="onClick">Activer la caméra</button>
            </div>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
.intro-background {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    
    z-index: 101;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 23px;
    
    color: white;
    background-color: rgba(16, 6, 1, 0.7);
    backdrop-filter: blur(4px);

    .intro-container {
        opacity: 0;
        width: 100%;
        max-width: 800px;
        padding: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 32px;

        @media (max-width: 900px) {
            padding: 16px;
        }

        .intro-text {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
        }

        .ready {
            opacity: 1;
        }

        p {
            font-size: 24px;
            text-align: center;

            color: #fff;
            text-align: center;
            position: relative;
        }
    }
}
</style>
