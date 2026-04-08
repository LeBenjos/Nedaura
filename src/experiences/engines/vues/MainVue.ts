import { createApp } from "vue";
import App from './MainVue.vue';

class MainVue {
    public init(): void {
        createApp(App).mount('#app');
    }
}

export default new MainVue();