import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Archive from '../views/Archive.vue'
import Bestiary from '../views/Bestiary.vue'
import VolumeDetail from '../views/VolumeDetail.vue'
import ApostleDetail from '../views/ApostleDetail.vue'
import Statistics from '../views/Statistics.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', component: Dashboard, name: 'dashboard' },
  { path: '/archive', component: Archive, name: 'archive' },
  { path: '/archive/:id', component: VolumeDetail, name: 'volume-detail' }, // individual volume page
  { path: '/bestiary', component: Bestiary, name: 'bestiary' },
  { path: '/bestiary/:id', component: ApostleDetail, name: 'apostle-detail' }, // individual apostle page
  { path: '/stats', component: Statistics, name: 'statistics' },
  { path: '/settings', component: Settings, name: 'settings' },
]

export default createRouter({
  // Hash history keeps routing working on Cloudflare Pages without any server config
  history: createWebHashHistory(),
  routes,
  // Always scroll to top on navigation — avoids inheriting scroll position from the previous page
  scrollBehavior: () => ({ top: 0 }),
})
