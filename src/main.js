import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'


// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import { formatCurrency } from './utils/formatCurrency'
import { formatFullDateTime } from './utils/formatCurrency'
import { formatTime } from './utils/formatCurrency'


// Create vue app
const app = createApp(App)


//app.use(permissionsPlugin)


app.config.globalProperties.$formatCurrency = formatCurrency
app.config.globalProperties.$formatFullDateTime = formatFullDateTime
app.config.globalProperties.$formatTime = formatTime


// Register plugins
registerPlugins(app)


// Mount vue app
app.mount('#app')
