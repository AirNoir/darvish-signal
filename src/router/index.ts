import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/LandingPage.vue';
import KZoneApp from '../views/KZoneApp.vue';
import TradeRecordsView from '../views/TradeRecordsView.vue';
import FeedView from '../views/FeedView.vue';
import AboutView from '../views/AboutView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/industry-map',
      name: 'industry-map',
      component: () => import('../views/IndustryAtlasView.vue'),
      props: {
        mapId: 'ai',
        src: '/industry-atlas/index.html',
        pageTitle: 'AI 產業地圖｜達比 K-Zone',
        frameTitle: 'AI 產業地圖：互動晶片拆解、產業鏈與台灣企業'
      }
    },
    {
      path: '/leo-map',
      name: 'leo-map',
      component: () => import('../views/IndustryAtlasView.vue'),
      props: {
        mapId: 'leo',
        src: '/leo-atlas/index.html',
        pageTitle: '低軌衛星產業地圖｜達比 K-Zone',
        frameTitle: '低軌衛星產業地圖：互動衛星拆解、產業鏈與台灣企業'
      }
    },
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
