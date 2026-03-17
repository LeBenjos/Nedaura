import { createApp } from 'vue';
import App from './experiences/engines/vues/MainVue.vue';
import Experience from './experiences/Experience';

createApp(App).mount('#app');

void Experience.init();
