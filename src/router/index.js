import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Archive from '../views/Archive.vue'
import Bestiary from '../views/Bestiary.vue'
import VolumeDetail from '../views/VolumeDetail.vue'
import ApostleDetail from '../views/ApostleDetail.vue'

const routes = [
  { path: '/', component: Dashboard, name: 'dashboard' },
  { path: '/archive', component: Archive, name: 'archive' },
  { path: '/archive/:id', component: VolumeDetail, name: 'volume-detail' },
  { path: '/bestiary', component: Bestiary, name: 'bestiary' },
  { path: '/bestiary/:id', component: ApostleDetail, name: 'apostle-detail' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
