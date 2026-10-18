export const SOCKET_EVENTS = {
  stockUpdated: 'stock:updated',
  productionCreated: 'production:created',
  photoCreated: 'photo:created',
  dashboardRefresh: 'dashboard:refresh',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
