import type { Store, ChatApiMessage } from '../types/index.js'

export async function fetchStores(): Promise<Store[]> {
  const res = await fetch('/api/stores')
  if (!res.ok) throw new Error('Failed to fetch stores')
  const data = await res.json() as { stores: Store[] }
  return data.stores
}

export async function sendSkillChatMessage(
  storeId: string,
  skill: string,
  messages: ChatApiMessage[],
  onEvent: (event: string, data: unknown) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/skill-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_id: storeId, skill, messages }),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    let eventName = ''
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventName = line.slice(7).trim()
      } else if (line.startsWith('data: ') && eventName) {
        try {
          const data = JSON.parse(line.slice(6)) as unknown
          onEvent(eventName, data)
        } catch {
          // ignore parse errors
        }
        eventName = ''
      }
    }
  }
}

export async function sendChatMessage(
  storeId: string,
  messages: ChatApiMessage[],
  onEvent: (event: string, data: unknown) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_id: storeId, messages }),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    let eventName = ''
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventName = line.slice(7).trim()
      } else if (line.startsWith('data: ') && eventName) {
        try {
          const data = JSON.parse(line.slice(6)) as unknown
          onEvent(eventName, data)
        } catch {
          // ignore parse errors
        }
        eventName = ''
      }
    }
  }
}

export async function sendAgentChatMessage(
  storeId: string,
  messages: ChatApiMessage[],
  onEvent: (event: string, data: unknown) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/agent-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_id: storeId, messages }),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    let eventName = ''
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventName = line.slice(7).trim()
      } else if (line.startsWith('data: ') && eventName) {
        try {
          const data = JSON.parse(line.slice(6)) as unknown
          onEvent(eventName, data)
        } catch {
          // ignore parse errors
        }
        eventName = ''
      }
    }
  }
}

export async function triggerAgent(
  storeId: string,
  onEvent: (event: string, data: unknown) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/agent/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_id: storeId }),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    let eventName = ''
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventName = line.slice(7).trim()
      } else if (line.startsWith('data: ') && eventName) {
        try {
          const data = JSON.parse(line.slice(6)) as unknown
          onEvent(eventName, data)
        } catch {
          // ignore parse errors
        }
        eventName = ''
      }
    }
  }
}
