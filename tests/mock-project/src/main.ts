import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

const getUrl = () => {
  console.log(window.location.href);
};

const getUserAgent = () => {
  console.log(window.navigator.userAgent);
};

createApp(App).mount('#app');

getUrl();
getUserAgent();
