// Multi-screen Socket.io client — imported by main.js
//
// URL params:
//   ?role=podium | projector | tv | touchdesigner   → this window's identity
//   ?server=http://192.168.x.x:3001                 → override server address

import { io } from 'socket.io-client'

export const ROLE = new URLSearchParams(window.location.search).get('role') || null

const _serverParam = new URLSearchParams(window.location.search).get('server')
if (_serverParam) localStorage.setItem('bec_server', _serverParam)
const SERVER_URL = localStorage.getItem('bec_server') || 'http://localhost:3001'

// Any page without an explicit role registers as 'projector' so that plain
// http://localhost:5173 responds to showGalaxy without needing a URL param.
const _effectiveRole = ROLE || 'projector'

let _socket   = null
const _handlers = {}   // fn → callback(args, rawMsg)

export function onMessage(fn, cb) {
  _handlers[fn] = cb
}

export function send(to, fn, args = []) {
  _socket?.emit('msg', { from: _effectiveRole, to, fn, args })
}

export function initMultiscreen() {
  _socket = io(SERVER_URL, {
    reconnection:        true,
    reconnectionDelay:   1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  })

  _socket.on('connect', () => {
    _socket.emit('register', { role: _effectiveRole })
    console.log(`[multiscreen] "${_effectiveRole}" connected → ${SERVER_URL}`)
  })

  _socket.on('msg', msg => {
    _handlers[msg.fn]?.(msg.args ?? [], msg)
  })

  _socket.on('disconnect', reason => {
    console.warn(`[multiscreen] disconnected (${reason}) — reconnecting`)
  })
}
