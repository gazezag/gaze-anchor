import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

import { Gaze } from 'gaze-anchor';

Gaze.init({});

createApp(App).mount('#app');
