// Простой менеджер для работы с iframe и postMessage

export function IframeManager(options) {
  // options: { iframe, src, allowedOrigin?, onMessage?, onLoad?, onError? }
  this.iframe = options.iframe
  this.src = options.src
  this.allowedOrigin = options.allowedOrigin
  this.onMessage = options.onMessage
  this.onLoad = options.onLoad
  this.onError = options.onError

  this._handleMessage = event => {
    // Если задан allowedOrigin, фильтруем по origin
    if (this.allowedOrigin && event.origin !== this.allowedOrigin) {
      return
    }

    if (typeof this.onMessage === 'function') {
      this.onMessage(event.data, event)
    }
  }

  this._handleLoad = () => {
    if (typeof this.onLoad === 'function') {
      this.onLoad()
    }
  }

  this._handleError = error => {
    if (typeof this.onError === 'function') {
      this.onError(error?.message || 'Неизвестная ошибка')
    }
  }

  this._init()
}

IframeManager.prototype._init = function () {
  if (!this.iframe) {
    throw new Error('Iframe element is required')
  }

  // Навешиваем обработчики
  window.addEventListener('message', this._handleMessage)
  this.iframe.addEventListener('load', this._handleLoad)
  this.iframe.addEventListener('error', this._handleError)

  // Устанавливаем исходный src
  this.setSrc(this.src)
}

IframeManager.prototype.setSrc = function (src) {
  if (!src) {
    return
  }

  this.src = src
  this.iframe.src = src
}

IframeManager.prototype.sendMessage = function (data) {
  if (!this.iframe || !this.iframe.contentWindow) {
    return
  }

  const targetOrigin = this.allowedOrigin || '*'
  this.iframe.contentWindow.postMessage(data, targetOrigin)
}

IframeManager.prototype.destroy = function () {
  window.removeEventListener('message', this._handleMessage)

  if (this.iframe) {
    this.iframe.removeEventListener('load', this._handleLoad)
    this.iframe.removeEventListener('error', this._handleError)
  }
}

