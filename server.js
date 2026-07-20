// BEC Multi-screen relay server — Socket.io edition
// Run:  node server.js
//
// Each screen/device opens the site with ?role=tv|podium|projector|touchdesigner
// Messages flow:  sender → server → room(s) → receiver(s)

import { createServer } from 'http'
import { Server }       from 'socket.io'

const PORT = process.env.PORT || 3001

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*' },          // allow any origin (local network install)
  pingInterval: 5000,             // heartbeat every 5 s
  pingTimeout:  10000,            // drop after 10 s silence
})

io.on('connection', socket => {

  // First message from each client: register its role and join the right room
  socket.on('register', ({ role }) => {
    socket.data.role = role
    socket.join(`role:${role}`)                         // e.g. 'role:podium'
    socket.emit('registered', { role })
    console.log(`[+] ${role}  (online: ${io.engine.clientsCount})`)
  })

  // Route a message to a specific role-room or broadcast to all
  socket.on('msg', msg => {
    const label = msg.fn || msg.type || '?'
    const from  = socket.data.role || '?'
    console.log(`[→] ${from} → ${msg.to}: ${label}`)

    if (msg.to === 'all') {
      socket.broadcast.emit('msg', msg)                 // everyone except sender
    } else {
      io.to(`role:${msg.to}`).emit('msg', msg)          // target role only
    }
  })

  socket.on('disconnect', reason => {
    console.log(`[-] ${socket.data.role || '?'}  (${reason})`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`\nBEC multi-screen server  →  http://localhost:${PORT}`)
  console.log('Roles:  tv | podium | projector | touchdesigner\n')
})
