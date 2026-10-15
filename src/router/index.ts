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
      path: '/drone-map',
      name: 'drone-map',
      component: () => import('../views/IndustryAtlasView.vue'),
      props: {
        mapId: 'drone',
        src: '/industry-atlas/drone.html',
        pageTitle: '無人機產業地圖｜達比 K-Zone',
        frameTitle: '無人機產業地圖：產業鏈拆解與台灣企業'
      }
    },
    {
      path: '/robot-map',
      name: 'robot-map',
      component: () => import('../views/IndustryAtlasView.vue'),
      props: {
        mapId: 'robot',
        src: '/industry-atlas/robot.html',
        pageTitle: '機器人產業地圖｜達比 K-Zone',
        frameTitle: '機器人產業地圖：產業鏈拆解與台灣企業'
      }
    },
    // 舊路徑（曾部署到測試機）導向新命名
    { path: '/industry-map/drone', redirect: '/drone-map' },
    { path: '/industry-map/robot', redirect: '/robot-map' },
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
