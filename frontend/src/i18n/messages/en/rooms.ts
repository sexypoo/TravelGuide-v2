import type { Messages } from '../types';

export const rooms: Messages['rooms'] = {
  roomName: (city) => `${city} help room`,
  access: {
    AVAILABLE: 'Open to you',
    TRAVELER_PENDING: 'Traveler review pending',
    LOCAL_PENDING: 'Local review pending',
    VERIFICATION_REQUIRED: 'Verification needed',
  },
  list: {
    title: 'Help rooms',
    description:
      "In each city, ask the people who live there what's happening right now.",
    emptyTitle: 'No help rooms are open yet',
    emptyDescription: "They'll show up here once a city is ready.",
    domestic: 'In Korea',
    temporary: 'Trial rooms',
    temporaryNote:
      'Run by exchange students abroad as a trial. They may close at any time.',
  },
  locked: {
    description: 'Only verified travelers and locals can chat here.',
    backLabel: 'Help rooms',
    pendingTitle: 'The room opens once your review is done',
    lockedTitle: (city) => `Get verified to open the ${city} help room`,
    pendingBody: 'You can see the result on the verification screen.',
    lockedBody:
      'Travelers verify with their itinerary and a booking. Locals verify with their location and proof of residence.',
    viewReview: 'See review status',
    verifyTraveler: 'Verify as a traveler',
    verifyLocal: 'Verify as a local',
    areaLabel: 'Coverage area',
    areaTitle: (city) => `All of ${city}`,
    areaDescription: (radiusKm) =>
      `Live updates within ${radiusKm} km of the center`,
    privacyTitle: 'Your proof stays private',
    privacyDescription:
      'Only admins see it for review, and your exact location is never shown to others',
    communityNotice:
      'You can ask and share travel tips in the community without verification.',
  },
  card: {
    noTopics: 'No open topics yet',
    openTopics: (count, more) =>
      `${count}${more ? '+' : ''} open ${count === 1 && !more ? 'topic' : 'topics'}`,
    live: 'Open now',
    pendingSub:
      'Once your review is done, you can chat with verified travelers and locals.',
    lockedSub:
      "Only verified travelers and locals can join to ask and answer what's happening now.",
    viewReview: 'See review status',
    verifyAndJoin: 'Get verified to join',
    viewIntro: 'About this room',
    liveSub: "Verified travelers and locals share what's happening now.",
    feedLabel: 'Open topics',
    postedAt: (relative) => `Posted ${relative}`,
    answersLabel: (count) => `${count} ${count === 1 ? 'answer' : 'answers'}`,
    answersShort: (count) => `${count} ${count === 1 ? 'reply' : 'replies'}`,
    enter: 'Enter room',
  },
  experience: {
    connection: {
      connecting: 'Checking connection',
      connected: 'Live',
      reconnecting: 'Reconnecting',
      offline: 'Live connection lost',
    },
    connectedNote: 'Only verified travelers and locals chat here',
    role: {
      BOTH: 'Verified traveler · local',
      LOCAL: 'Verified local',
      TRAVELER: 'Verified traveler',
      none: 'Admin · read only',
    },
    home: 'Back to home',
    viewTabs: 'Room view',
    chatTab: 'Chat',
    topicsTab: 'Live topics',
    conversationLabel: (city) => `${city} chat`,
    liveChatHeading: 'Live chat',
    offlineNotice:
      "Please check your internet connection. Missed messages will load automatically once you're back.",
    reconnectingNotice:
      "Restoring the live connection. Missed messages will load automatically once it's back.",
    openTopics: 'Open topics',
    newTopic: 'New topic',
    closeComposer: 'Close topic form',
    topicStatus: 'Topic status',
    open: 'Open',
    resolved: 'Resolved',
  },
  notifications: {
    loading: {
      label: 'Checking alerts',
      detail: 'Checking your browser settings.',
    },
    unsupported: {
      label: 'Alerts not supported',
      detail: "This browser can't show system notifications.",
    },
    blocked: {
      label: 'Blocked by browser',
      detail: "Allow notifications in your browser's site settings.",
    },
    prompt: {
      label: 'Turn on alerts',
      detail:
        "We'll let you know about new messages and answers while you're on another tab.",
    },
    disabled: {
      label: 'Alerts off',
      detail: 'You can turn alerts back on for this browser.',
    },
    enabled: {
      label: 'Alerts on',
      detail: "We'll send updates in the background while the web app is open.",
    },
  },
};
