import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import KZoneApp from '../views/KZoneApp.vue';
import TradeRecordsView from '../views/TradeRecordsView.vue';
import FeedView from '../views/FeedView.vue';
import AboutView from '../views/AboutView.vue';
import WatchlistView from '../views/WatchlistView.vue';

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
    },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: WatchlistView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    }
  ]
});

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

router.afterEach((to) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: to.fullPath,
    page_location: window.location.href,
    page_title: document.title
  });
});

export default router;
