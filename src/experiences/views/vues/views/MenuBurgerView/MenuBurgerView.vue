<script setup lang="ts">
import { onMounted, ref } from 'vue';
import gsap from 'gsap';
import SoundManager from '@/managers/SoundManager';
import { isWebcamVisible, toggleWebcam } from '../../../mediapipe/webcamVisibility';

const isSoundOn = ref(true);
const isMenuOpen = ref(false);
const closedRef = ref<HTMLDivElement | null>(null);
const openRef = ref<HTMLDivElement | null>(null);
const buttonsWrapperRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
    gsap.set(openRef.value, { opacity: 0, rotate: -45, scale: 0.5 });
});

const onClickSound = (): void => {
    isSoundOn.value = !isSoundOn.value;
    SoundManager.toggleMute();
};

const onClickCamera = (): void => {
    toggleWebcam();
};

const onClickBurger = (): void => {
    isMenuOpen.value = !isMenuOpen.value;

    if (isMenuOpen.value) {
        gsap.to(closedRef.value, { opacity: 0, scale: 0.5, duration: 0.2, ease: 'power2.in' });
        gsap.to(openRef.value, { opacity: 1, rotate: 0, scale: 1, duration: 0.3, ease: 'power2.out', delay: 0.1 });

        gsap.fromTo(
            buttonsWrapperRef.value,
            { opacity: 0, pointerEvents: 'none' },
            { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' }
        );
    } else {
        gsap.to(openRef.value, { opacity: 0, rotate: -45, scale: 0.5, duration: 0.2, ease: 'power2.in' });
        gsap.to(closedRef.value, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', delay: 0.1 });

        gsap.to(buttonsWrapperRef.value, {
            opacity: 0,
            pointerEvents: 'none',
            duration: 0.3,
            ease: 'power2.in',
        });
    }
};

const onClickReload = (): void => {
    window.location.reload();
};

</script>

<template>
    <transition name="menu-burger">
        <nav class="menu">
            <div class="menu-burger-wrapper" @click="onClickBurger">
                <div class="menu-burger">
                    <div class="closed" ref="closedRef"> 
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>    
                    </div>
                    <div class="open" ref="openRef">
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 0.5L16.5 16.5" stroke="white" stroke-linecap="round"/>
                            <path d="M16.5 0.5L1 16.5" stroke="white" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="buttons-wrapper" ref="buttonsWrapperRef">            
                <div class="buttons">
                    <div class="menu-item-wrapper">
                        <a href="#" class="menu-item" @click="onClickSound">
                            <img src="/assets/icons/sound_on.svg" alt="Sound On" v-if="isSoundOn" />
                            <img src="/assets/icons/sound_off.svg" alt="Sound Off" v-else />
                        </a>
                    </div>
                    <div class="menu-item-wrapper">
                        <a href="#" class="menu-item" @click="onClickCamera">
                            <svg
                                width="35"
                                height="25"
                                viewBox="0 0 24 24"
                                fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke="#000000"
                            v-if="isWebcamVisible"
                        >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path
                                    d="M21 13C21 10.3333 20.5 8 20 7.66667C19.6796 7.45303 18.1268 7.2394 16 7.11352C14.8083 7.04298 17 5 12 5C7 5 9.19168 7.04298 8 7.11352C5.87316 7.2394 4.32045 7.45303 4 7.66667C3.5 8 3 10.3333 3 13C3 15.6667 3.5 18 4 18.3333C4.5 18.6667 8 19 12 19C16 19 19.5 18.6667 20 18.3333C20.5 18 21 15.6667 21 13Z"
                                    stroke="#ffffff"
                                    stroke-width="1"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                ></path>
                                <path
                                    d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
                                    stroke="#ffffff"
                                    stroke-width="1"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                ></path>
                            </g>
                        </svg>
                        <svg
                            width="35"
                            height="25"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            v-else
                        >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path
                                    d="M10 5H14.5C15.0523 5 15.5 5.44772 15.5 6C15.5 6.55228 15.9477 7 16.5 7H19C20.1046 7 21 7.89543 21 9V16M3 3L21 21M11.6598 15.9809C10.2795 15.8251 9.18287 14.7327 9.02069 13.3543M3 9V17C3 18.1046 3.89543 19 5 19H14"
                                    stroke="#ffffff"
                                    stroke-width="1"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                ></path>
                            </g>
                        </svg>
                    </a>
                    </div>
                    <div class="menu-item-wrapper">
                        <a href="#" class="menu-item" @click="onClickReload">
                            <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.39645 0.146447C7.59171 -0.0488155 7.90822 -0.0488155 8.10348 0.146447L10.3964 2.43942C10.9821 3.02518 10.9821 3.97474 10.3964 4.56051L8.10348 6.85348C7.90822 7.04874 7.59171 7.04874 7.39645 6.85348C7.20118 6.65822 7.20118 6.34171 7.39645 6.14645L9.68942 3.85348C9.88458 3.65824 9.88458 3.34169 9.68942 3.14645L7.39645 0.853478C7.20118 0.658216 7.20118 0.341709 7.39645 0.146447Z" fill="white"/>
                            <path d="M11.1036 17.8536C10.9083 18.0488 10.5918 18.0488 10.3965 17.8536L8.10355 15.5606C7.51787 14.9748 7.51787 14.0253 8.10355 13.4395L10.3965 11.1465C10.5918 10.9513 10.9083 10.9513 11.1036 11.1465C11.2988 11.3418 11.2988 11.6583 11.1036 11.8536L8.81059 14.1465C8.61542 14.3418 8.61542 14.6583 8.81058 14.8536L11.1036 17.1465C11.2988 17.3418 11.2988 17.6583 11.1036 17.8536Z" fill="white"/>
                            <path d="M5.27539 2.97461L5.80078 3.5L5.27539 4.02539C5.20299 4.09779 5.13504 4.17309 5.07031 4.25H2.75C2.05964 4.25 1.5 4.80964 1.5 5.5V12.5C1.5 13.1904 2.05964 13.75 2.75 13.75H4.72754C4.64399 14.2464 4.64504 14.7537 4.72852 15.25H2.75C1.23122 15.25 0 14.0188 0 12.5V5.5C0 3.98122 1.23122 2.75 2.75 2.75H5.07031C5.13504 2.82691 5.203 2.90221 5.27539 2.97461ZM15.75 2.75C17.2688 2.75 18.5 3.98122 18.5 5.5V12.5C18.5 14.0188 17.2688 15.25 15.75 15.25H13.4297C13.365 15.1731 13.297 15.0978 13.2246 15.0254L12.6992 14.5L13.2246 13.9746C13.297 13.9022 13.365 13.8269 13.4297 13.75H15.75C16.4404 13.75 17 13.1904 17 12.5V5.5C17 4.80964 16.4404 4.25 15.75 4.25H13.7725C13.856 3.75359 13.855 3.24629 13.7715 2.75H15.75Z" fill="white"/>
                            <path d="M13.25 14.5002L8.25 14.5002" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>

                        </a>
                    </div>
                </div>
            </div>
        </nav>
    </transition>
</template>

<style lang="scss" scoped>
.menu {
    position: absolute;
    top: 40px;
    right: 40px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;

    .menu-burger-wrapper {
        position: relative;
        border-radius: 45px;

        &::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 45px;
            padding: 1px;
            background: linear-gradient(135deg, rgba(251, 251, 251, 1), rgba(90, 40, 42, 1), rgba(227, 227, 227, 1), rgba(59, 19, 21, 1));
            -webkit-mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }


        .menu-burger {
            cursor: pointer;
            display: inline-flex;
            width: 48px;
            height: 48px;
            padding: 8px;
            justify-content: center;
            align-items: center;
            gap: 5px;

            border-radius: 100%;
            border-radius: 31px;
            background: rgba(139, 56, 75, 0.20);    
            cursor: pointer;
            
            transition: box-shadow 0.3s ease;
            display: flex;
            flex-direction: row;
            position: relative;

            &:hover {
                box-shadow: 0 -9px 8.4px 0 rgba(139, 56, 75, 0.40) inset, 0 9px 8.4px 0 rgba(255, 255, 255, 0.17) inset;
            }

            .closed, .open {
                position: absolute;
            }

            .closed {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                height: 100%;
                gap: 4px;
                
                .dot {
                    width: 6px;
                    height: 6px;
                    background-color: white;
                    border-radius: 50%;
                }
            }
            .open {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
            }
        }
    }

    .buttons-wrapper {
        position: relative;
        border-radius: 45px;
        opacity: 0;
        pointer-events: none;

        &::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 45px;
            padding: 1px;
            background: linear-gradient(135deg, rgba(251, 251, 251, 1), rgba(90, 40, 42, 1), rgba(227, 227, 227, 1), rgba(59, 19, 21, 1));
            -webkit-mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }

        .buttons {
            display: flex;
            padding: 12px 18px 12px 12px;
            align-items: center;
            gap: 12px;

            border-radius: 44px; // 1px de moins que le wrapper
            background: rgba(139, 56, 75, 0.20);

            .menu-item-wrapper {
                position: relative;
                border-radius: 100px;

                &::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 100px;
                    padding: 1px;
                    background: linear-gradient(135deg, rgba(251, 251, 251, 1), rgba(90, 40, 42, 1), rgba(227, 227, 227, 1), rgba(59, 19, 21, 1));
                    -webkit-mask:
                        linear-gradient(#fff 0 0) content-box,
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }

                // menu-item est un frère du ::before, pas dedans
                .menu-item {
                    cursor: pointer;
                    display: inline-flex;
                    width: 48px;
                    height: 48px;
                    padding: 8px;
                    justify-content: center;
                    align-items: center;

                    border-radius: 100px;
                    background: rgba(139, 56, 75, 0.40);
                    box-shadow: 0 -9px 8.4px 0 rgba(139, 56, 75, 0.30) inset, 0 9px 8.4px 0 rgba(255, 255, 255, 0.17) inset;
                    
                    transition: box-shadow 0.3s ease;
                    display: flex;
                    flex-direction: row;

                    &:hover {
                        box-shadow: 0 -9px 8.4px 0 rgba(139, 56, 75, 0.60) inset, 0 9px 8.4px 0 rgba(255, 255, 255, 0.34) inset;
                    }


                    img {
                        width: 20px;
                        height: 20px;
                    }
                }
            }
        }
    }
}
</style>
