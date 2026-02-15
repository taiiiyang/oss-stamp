import { setupStampCard } from './lifecycle'
import './style.css'

export default defineContentScript({
  matches: ['*://*.github.com/*'],
  cssInjectionMode: 'ui',
  main: ctx => setupStampCard(ctx),
})
