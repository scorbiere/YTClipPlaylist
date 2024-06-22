import { createRouter, createWebHistory } from 'vue-router';
import SegmentSelector from '../views/SegmentSelector.vue';
import ViewerInterface from '../views/ViewerInterface.vue';

const routes = [
  {
    path: '/',
    redirect: { name: 'SegmentSelector' }
  },
  {
    path: '/YTClipPlaylist/',
    name: 'SegmentSelector',
    component: SegmentSelector,
  },
  {
    path: '/YTClipPlaylist/viewer/:customHeader?',
    name: 'ViewerInterface',
    component: ViewerInterface,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
