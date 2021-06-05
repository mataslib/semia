// initializes svelte app on dom element
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')
})

export default app
