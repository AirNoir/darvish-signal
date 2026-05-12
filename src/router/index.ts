import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import KZoneApp from '../views/KZoneApp.vue';
import TradeRecordsView from '../views/TradeRecordsView.vue';
import FeedView from '../views/FeedView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/app/:symbol?',
      name: 'app',
      component: KZoneApp
    },
    {
      path: '/trade-records',
      name: 'trade-records',
      component: TradeRecordsView
    },
    {
      path: '/feed',
      name: 'feed',
      component: FeedView
    }
  ]
});

export default router;
