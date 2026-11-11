import type { Messages } from '../types';

export const home: Messages['home'] = {
  title: 'Home',
  greeting: (nickname) => `Hi, ${nickname}`,
  heading: (place) => [
    'What do you need to know',
    place === undefined ? 'on your trip?' : `in ${place} today?`,
  ],
  status: {
    approved: (city, participant) =>
      `Verified ${participant === 'TRAVELER' ? 'traveler' : 'local'} in ${city}`,
    pending: (participant) =>
      `${participant === 'TRAVELER' ? 'Traveler' : 'Local'} verification in review`,
    none: 'Not verified yet',
  },
  noRooms: {
    title: 'No help rooms are open yet',
    description:
      "They'll show up here once a city is ready. Meanwhile, ask in the community.",
  },
  pickRoom: {
    title: (count) =>
      `Help rooms are open in ${count} ${count === 1 ? 'city' : 'cities'}`,
    description:
      "Pick the city you're visiting or live in, get verified, and it shows up here.",
    action: 'Choose a help room',
  },
  ways: {
    label: 'Other ways to join in',
    communityTitle: 'Traveler community',
    communityDescription: 'Ask and share without verification',
    roomsTitle: 'Help rooms by city',
    roomsDescription: (count) =>
      `Ask what's happening right now in ${count} ${count === 1 ? 'city' : 'cities'}`,
  },
  posts: {
    title: 'New in the community',
    viewAll: 'See all',
    failed: "We couldn't load new posts.",
    emptyTitle: 'No posts yet',
    emptyDescription: 'Be the first to ask something about your trip.',
    comments: (count) => `${count} ${count === 1 ? 'comment' : 'comments'}`,
  },
  error: {
    title: "We couldn't load this screen",
    description: 'Check your connection and try again.',
    retry: 'Reload',
  },
  loading: 'Loading the screen',
};
