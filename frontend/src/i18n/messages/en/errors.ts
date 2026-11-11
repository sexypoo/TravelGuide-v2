import type { Messages } from '../types';

export const errors: Messages['errors'] = {
  generic: "We couldn't complete that. Please try again in a moment.",
  sessionExpired: 'Your session has expired. Please log in again.',
  serverDown: "We can't reach the server right now. Please try again shortly.",
  network: 'The connection is unstable. Please try again in a moment.',
};
