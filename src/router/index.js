import { createRouter, createWebHistory } from 'vue-router';
import SegmentSelector from '../views/SegmentSelector.vue';
import ViewerInterface from '../views/ViewerInterface.vue';

const routes = [
  {
    path: '/',
    name: 'SegmentSelector',
    component: SegmentSelector,
  },
  {
    path: '/viewer/:customHeader?',
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
