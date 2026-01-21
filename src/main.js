import './styles.css'
import { IframeManager } from './iframe-manager'

const app = document.querySelector('#app')

// Создаем базовую разметку
app.innerHTML = `
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Viewer iframe shell (Vite)</h1>
      <div class="page-actions">
        <button id="send-message-btn" class="btn">Отправить сообщение в iframe</button>
        <button id="clear-log-btn" class="btn btn-secondary">Очистить лог</button>
      </div>
    </header>
    <main class="page-main">
      <section class="viewer-section">
        <iframe id="viewer-iframe" title="viewer3D" class="viewer-iframe"></iframe>
      </section>
      <aside class="log-section">
        <h2 class="log-title">Сообщения</h2>
        <div id="log-output" class="log-output"></div>
      </aside>
    </main>
  </div>
`

const iframeElement = document.querySelector('#viewer-iframe')
const logOutput = document.querySelector('#log-output')
const sendMessageBtn = document.querySelector('#send-message-btn')
const clearLogBtn = document.querySelector('#clear-log-btn')

// Определяем источник iframe в dev/prod режимах
// Файлы viewer'а перенесены в public/iframe, поэтому Vite отдает их как статику
const iframeSrc = import.meta.env.DEV
  ? '/iframe/index-dev.html'
  : '/iframe/index-dev.html'

// Функция логирования в правый блок
function appendLog(message, type) {
  const item = document.createElement('div')
  item.className = `log-item log-item-${type}`
  const time = new Date().toLocaleTimeString()
  item.textContent = `[${time}] ${message}`
  logOutput.appendChild(item)
  logOutput.scrollTop = logOutput.scrollHeight
}

// Инициализируем менеджер iframe
const iframeManager = new IframeManager({
  iframe: iframeElement,
  src: iframeSrc,
  // origin можно зафиксировать, если viewer будет хоститься на отдельном домене
  // allowedOrigin: 'http://localhost:4173',
  onMessage: data => {
    appendLog(`Получено из iframe: ${JSON.stringify(data)}`, 'incoming')
  },
  onLoad: () => {
    appendLog('iframe загружен', 'system')
  },
  onError: error => {
    appendLog(`Ошибка iframe: ${error}`, 'error')
  }
})

// Обработчик кнопки отправки сообщения
sendMessageBtn.addEventListener('click', () => {
  const payload = {
    type: 'PING_FROM_PARENT',
    timestamp: Date.now()
  }

  iframeManager.sendMessage(payload)
  appendLog(`Отправлено в iframe: ${JSON.stringify(payload)}`, 'outgoing')
})

// Очистка лога
clearLogBtn.addEventListener('click', () => {
  logOutput.innerHTML = ''
})

// Корректно уничтожаем слушатели при горячей перезагрузке (Vite HMR)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    iframeManager.destroy()
  })
}

