<script setup lang="ts">
import MediapipeView from '../../views/mediapipe/MediapipeView.vue';
import InterfaceManager from '../../views/vues/components/InterfaceManager.vue';
import { useInterfaceManager } from '../../views/vues/hooks/useInterfaceManager';
import LoaderView from '../../views/vues/LoaderView.vue';
import LoaderManager from '../../managers/LoaderManager';
import { onMounted, ref } from 'vue';
import MenuView from '../../views/vues/Menu/MenuView.vue';
import MenuBurgerView from '../../views/vues/MenuBurgerView.vue/MenuBurgerView.vue';

const isVisible = ref(false);

const { mount, unmount } = useInterfaceManager();

onMounted(() => {
    LoaderManager.onHide.add(onShow);
});

const onShow = (): void => {
    mount({ id: 'menu', component: MenuView });
    mount({ id: 'menu-burger', component: MenuBurgerView });
    isVisible.value = true;
};
</script>

<template>
    <div id="loader">
        <LoaderView />
    </div>
    <div v-if="isVisible">
        <InterfaceManager />
    </div>
    <div class="mediapipe-container">
        <MediapipeView />
    </div>
</template>
