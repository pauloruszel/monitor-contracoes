export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

export function triggerBrowserNotification(title, body) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  new Notification(title, { body })
}

export function triggerVoiceAlert(message) {
  if (!('speechSynthesis' in window) || !message) return
  const utterance = new SpeechSynthesisUtterance(message)
  utterance.lang = 'pt-BR'
  utterance.rate = 1
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

export function triggerSoundAlert(urgency = 'attention') {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextCtor) return

  const context = new AudioContextCtor()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = urgency === 'critical' ? 880 : urgency === 'warning' ? 660 : 540
  gain.gain.value = 0.0001
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()

  const now = context.currentTime
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
  oscillator.stop(now + 0.38)
  oscillator.onended = () => context.close()
}
