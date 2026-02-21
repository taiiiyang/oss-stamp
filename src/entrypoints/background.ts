export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'open-options') {
      void browser.runtime.openOptionsPage()
      sendResponse({ ok: true })
    }
    return true // keep message channel open for async
  })
})
