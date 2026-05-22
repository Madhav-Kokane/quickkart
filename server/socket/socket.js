export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Customer joins their order's room to receive live updates
    socket.on('join-order-room', (orderId) => {
      socket.join(orderId);
      console.log(`Joined order room: ${orderId}`);
    });

    // Agent shares their live GPS location
    // Server relays it to everyone in that order's room
    socket.on('agent-location', ({ orderId, lat, lng }) => {
      io.to(orderId).emit('agent-location', { lat, lng });
    });

    // Agent joins their own room to receive new order notifications
    socket.on('join-agent-room', (agentId) => {
      socket.join(`agent_${agentId}`);
      console.log(`Agent joined room: agent_${agentId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};