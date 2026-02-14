import ReactDOM from 'react-dom/client'
import { githubTheme } from '@/lib/token-storage'
import { App } from './app'
import '@/assets/styles/theme.css'

function syncTheme() {
  void githubTheme.getValue().then((theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  })
}

syncTheme()

githubTheme.watch((theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
})

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
