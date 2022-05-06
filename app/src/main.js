import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import store from './store.js';

import Layout from './components/Layout.vue';
import App from './App.vue';

import './draft3d';

import './assets/styles/tailwind.css';


const routes = [
  { path: '/', component: Layout },
  { path: '/entity/:entity', component: Layout },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);
app.use(store);
app.use(router);


app.mount('#app');
