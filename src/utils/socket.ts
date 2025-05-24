import { Server as IOServer } from 'socket.io'
import http from 'http'

let io: IOServer | null = null

export const initSocket = (server: http.Server) => {
	io = new IOServer(server, {
		cors: {
			origin: process.env.FRONTEND_DEV_URL,
			methods: ['GET', 'POST'],
			credentials: true,
		},
	})

	const connectedUsers = new Map<string, string>() // userId => socketId

	io.on('connection', (socket) => {
		console.log('Socket connected:', socket.id)

		socket.on('register', (userId: string) => {
			connectedUsers.set(userId, socket.id)
		})

		socket.on('disconnect', () => {
			console.log('Socket disconnected:', socket.id)
			for (const [userId, sId] of connectedUsers.entries()) {
				if (sId === socket.id) {
					connectedUsers.delete(userId)
					break
				}
			}
		})
	})

	return {
		emitToUser: (userId: string, event: string, payload: any) => {
			const socketId = connectedUsers.get(userId)
			if (socketId && io) {
				io.to(socketId).emit(event, payload)
			}
		},
	}
}
