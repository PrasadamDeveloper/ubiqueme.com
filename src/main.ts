import './styles.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import { vLazyVideo } from './directives/vLazyVideo'
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
  FaFlag,
  RiZhihuFill,
  CoHome,
  CoUser,
  CoQrCode,
  CoSettings,
  IoLogOut,
  BiQuestionCircle,
  FaBell,
  IoLogIn,
  RiLogoutBoxRLine,
  MdHomeRound,
  MdQrcodescannerRound,
  MdNotificationsnoneOutlined,
  MdSettings,
  MdHelpSharp,
  BiPersonFill,
  BiPersonCircle,
  BiWhatsapp,
} from 'oh-vue-icons/icons'

addIcons(
  FaFlag,
  RiZhihuFill,
  CoHome,
  CoUser,
  CoQrCode,
  CoSettings,
  IoLogOut,
  BiQuestionCircle,
  FaBell,
  IoLogIn,
  RiLogoutBoxRLine,
  MdHomeRound,
  MdQrcodescannerRound,
  MdNotificationsnoneOutlined,
  MdSettings,
  MdHelpSharp,
  BiPersonFill,
  BiPersonCircle,
  BiWhatsapp,
)

const app = createApp(App)

app.component('v-icon', OhVueIcon)
app.use(VueViewer)
app.use(FloatingVue)
app.directive('lazy-video', vLazyVideo)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

app.mount('#app')
