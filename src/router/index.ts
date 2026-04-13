import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import KZoneApp from '../views/KZoneApp.vue';
import TradeRecordsView from '../views/TradeRecordsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/app',
      name: 'app',
      component: KZoneApp
    },
    {
      path: '/trade-records',
      name: 'trade-records',
      component: TradeRecordsView
    }
  ]
});

export default router;
