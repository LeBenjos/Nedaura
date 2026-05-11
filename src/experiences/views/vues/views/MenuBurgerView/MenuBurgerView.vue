<script setup lang="ts">
import { ref } from 'vue';
import SoundManager from '@/managers/SoundManager';
import { isWebcamVisible, toggleWebcam } from '../../../mediapipe/webcamVisibility';

const isSoundOn = ref(true);

const onClickSound = (): void => {
    isSoundOn.value = !isSoundOn.value;
    SoundManager.toggleMute();
};

const onClickCamera = (): void => {
    toggleWebcam();
};
</script>

<template>
    <transition name="menu-burger">
        <div class="menu-burger-container">
            <nav class="menu">
                <input type="checkbox" class="menu-open" name="menu-open" id="menu-open" />
                <label class="menu-open-button" for="menu-open">
                    <span class="hamburger dot-1"></span>
                    <span class="hamburger dot-2"></span>
                    <span class="hamburger dot-3"></span>
                </label>

                <a href="#" class="menu-item" @click="onClickSound">
                    <svg
                        width="22"
                        height="15"
                        viewBox="0 0 22 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        v-if="isSoundOn"
                    >
                        <path
                            d="M14.1286 0.422523C14.3547 0.649676 14.5243 1.00105 14.5525 1.32403L14.4536 18.2114C13.5174 19.411 12.9239 19.0597 11.8428 18.3605C9.85376 17.0685 7.96012 15.1661 6.02761 13.7535C4.27176 13.214 1.48076 14.4385 0.38909 12.5077C-0.0631228 11.7092 -0.0454583 8.71004 0.0675948 7.6985C0.417353 4.5787 3.58637 5.71446 5.76618 5.45182L12.5352 0.206018C13.0722 -0.156006 13.694 -0.0140355 14.1286 0.422523ZM12.9062 1.09688L6.51162 6.01615C6.36677 6.31429 6.32791 12.0108 6.41623 12.6568C6.44803 12.9017 6.44803 13.1182 6.68474 13.2708C7.83646 13.8139 12.3763 18.112 13.2171 18.0517L13.634 17.7464L13.4962 1.13947C13.3231 1.01525 13.104 1.05429 12.9062 1.09333V1.09688ZM1.92237 6.37108C0.63286 6.37108 0.858967 10.3179 0.943757 11.2407C0.989684 11.7482 1.33944 12.7349 1.92237 12.7349H5.2751L5.54007 12.4687V6.63372L5.2751 6.36753H1.92237V6.37108Z"
                            fill="white"
                        />
                        <path
                            d="M16.708 6.72422C18.0858 7.93097 18.0258 11.6612 16.1463 12.5024C15.3655 11.7926 16.5596 11.2211 16.7221 10.4296C16.8069 10.0215 16.8175 9.29034 16.7645 8.87507C16.6338 7.82094 15.4044 7.26016 16.1533 6.49707C16.3547 6.52192 16.5526 6.5929 16.708 6.72777V6.72422Z"
                            fill="white"
                        />
                        <path
                            d="M18.9981 14.9765C18.9098 14.2276 19.5846 13.8833 19.9202 13.3403C21.3475 11.0226 21.5489 8.36422 20.1287 5.97557C19.9273 5.63484 18.3163 4.00573 19.4397 4.00928C20.0686 4.00928 21.1497 5.93298 21.3758 6.49376C22.3473 8.90016 22.2025 11.3349 20.8352 13.5497C20.4431 14.1815 19.839 15.1149 18.9981 14.9765Z"
                            fill="white"
                        />
                    </svg>
                    <svg
                        width="22"
                        height="15"
                        viewBox="0 0 22 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        v-else
                    >
                        <path
                            d="M14.2785 0.384064C14.5427 0.643354 14.6605 1.27915 14.6962 1.6521C15.1531 6.64963 14.3356 12.3362 14.6855 17.4084C14.4035 19.1417 13.4003 19.4081 12.0259 18.4562C9.92682 17.0034 8.05262 15.1494 5.93925 13.7002C4.26497 13.2917 1.21629 14.336 0.280978 12.4144C-0.0474521 11.736 -0.0403123 8.38296 0.0632145 7.50209C0.395214 4.60018 3.80446 5.67996 5.82144 5.42778L12.7756 0.117671C13.1433 -0.159378 13.9929 0.103464 14.2785 0.384064ZM13.6002 18.0157C13.7323 17.7103 13.7787 17.3977 13.8037 17.0674C14.1714 12.0912 13.5074 6.6816 13.8037 1.65565C13.8537 0.938162 13.129 0.874228 12.6257 1.21166L6.39977 6.16657C6.73891 8.21602 6.22484 10.6384 6.47116 12.6453C6.49615 12.8406 6.47473 13.0324 6.66394 13.1638L13.0362 17.998L13.6002 18.0157ZM1.75534 6.35127C1.57328 6.55728 1.27698 6.75264 1.15203 6.99417C0.85216 7.56958 0.85573 10.6171 0.948547 11.3985C1.0021 11.8603 1.46261 12.7234 1.93384 12.7234H5.32166L5.5894 12.457V6.61766L5.32166 6.35127H1.75534Z"
                            fill="white"
                        />
                        <path
                            d="M19.7443 8.36184C20.3834 7.82905 21.3187 6.40829 22.0005 7.15064L20.0549 9.59791C20.6404 10.4042 21.7042 10.9334 21.9969 11.9209C21.772 13.0575 19.6444 10.2763 19.2303 10.2763C18.5663 10.6066 17.3918 12.5851 16.6421 12.1056C16.3137 11.8605 16.5243 11.7894 16.6314 11.5621C16.9955 10.7949 17.9987 10.3474 18.2557 9.94599C18.9268 8.89818 16.3351 7.74381 16.4636 7.15419C16.7456 5.85064 19.0232 8.78452 19.2339 8.82714H19.4016C19.5337 8.79873 19.6087 8.4684 19.7336 8.36539L19.7443 8.36184Z"
                            fill="white"
                        />
                    </svg>
                </a>
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
                                stroke-width="0.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                            <path
                                d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
                                stroke="#ffffff"
                                stroke-width="0.5"
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
                                stroke-width="0.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                        </g>
                    </svg>
                </a>
            </nav>

            <svg class="filters" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="shadowed-goo">
                        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="7" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
                            result="goo"
                        />
                        <feGaussianBlur in="goo" stdDeviation="2" result="shadow" />
                        <feColorMatrix
                            in="shadow"
                            mode="matrix"
                            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 -0.2"
                            result="shadow"
                        />
                        <feOffset in="shadow" dx="1" dy="1" result="shadow" />
                        <feComposite in2="shadow" in="goo" result="goo" />
                        <feComposite in2="goo" in="SourceGraphic" result="mix" />
                    </filter>
                </defs>
            </svg>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
.menu-burger-container {
    position: absolute;
    top: 0;
    right: 40px;
    z-index: 99990;
}

.filters {
    position: absolute;
    width: 0;
    height: 0;
}

.menu {
    filter: url('#shadowed-goo');
    position: absolute;
    top: 0;
    right: 0;
    box-sizing: border-box;
}

// Style glass partagé
%blob-style {
    background-blend-mode: hard-light;
    border: 2px solid rgba(255, 255, 255, 0.85);
    box-shadow: 0 0 8px 0 rgba(255, 255, 255, 0.7);
    border-radius: 100%;
    width: 40px;
    height: 40px;
    position: absolute;
    top: 40px;
    right: 0;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate3d(0, 0, 0);
    transition: transform ease-out 200ms;
}

.menu-item,
.menu-open-button {
    @extend %blob-style;
}

.menu-open {
    display: none;
}

// Dots → croix
.hamburger {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: white;
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -2.5px;
    transition: transform 200ms;
}

.dot-1 {
    margin-left: -10px;
}
.dot-2 {
    margin-left: -2.5px;
}
.dot-3 {
    margin-left: 5px;
}

.menu-open:checked + .menu-open-button .dot-1 {
    transform: translate3d(7.5px, 0, 0) rotate(45deg) scaleX(3);
}
.menu-open:checked + .menu-open-button .dot-2 {
    transform: scale(0.1, 1);
    opacity: 0;
}
.menu-open:checked + .menu-open-button .dot-3 {
    transform: translate3d(-7.5px, 0, 0) rotate(-45deg) scaleX(3);
}

// Bouton principal
.menu-open-button {
    z-index: 2;
    cursor: pointer;
    transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transition-duration: 400ms;
    transform: scale(1.05) translate3d(0, 0, 0);

    &:hover {
        box-shadow: 0 0 12px 2px rgba(255, 255, 255, 0.85);
        transform: scale(1.12) translate3d(0, 0, 0);
    }
}

.menu-open:checked + .menu-open-button {
    transition-timing-function: linear;
    transition-duration: 200ms;
    transform: scale(0.88) translate3d(0, 0, 0);
}

.menu-open:checked ~ .menu-item:nth-child(3) {
    transform: translate3d(0, 50px, 0);
    opacity: 1;
}
.menu-open:checked ~ .menu-item:nth-child(4) {
    transform: translate3d(0, 100px, 0);
    opacity: 1;
}
.menu-open:checked ~ .menu-item:nth-child(5) {
    transform: translate3d(0, 150px, 0);
    opacity: 1;
}

// Items — caché par défaut
.menu-item {
    cursor: pointer;
    transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
    transition-duration: 190ms;
    opacity: 0;

    &:hover {
        box-shadow: 0 0 12px 2px rgba(255, 255, 255, 0.85);
    }
}

.menu-open:checked ~ .menu-item {
    transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
    transition-duration: 190ms;
    transform: translate3d(0, 50px, 0);
    opacity: 1;
}
.menu-open:checked ~ .menu-item:nth-child(2) {
    transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
    transition-duration: 190ms;
    transform: translate3d(0, 100px, 0);
    opacity: 1;
}
</style>
