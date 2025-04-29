import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import store from './store.js';

import Layout from './components/Layout.vue';
import App from './App.vue';

import './assets/styles/tailwind.css';
import Bim from './components/Bim.vue';


const routes = [
  { path: '/bim', component: Bim },
  { path: '/entity/:entity', component: Layout },
  { path: '/', component: Layout },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(store);
app.use(router);


app.mount('#app');
