import type { Messages } from '../types';

export const topics: Messages['topics'] = {
  labels: {
    category: {
      WEATHER: 'Weather',
      TRANSPORT: 'Getting around',
      FOOD: 'Food & cafés',
      PLACE: 'Places to go',
      WAITING: 'Wait times',
      CROWD: 'Crowds',
      OPEN_HOURS: 'Open or closed',
      EVENT: 'Events',
      SAFETY: 'Safety',
      OTHER: 'Other',
    },
    crowd: {
      QUIET: 'Quiet',
      MODERATE: 'Moderate',
      BUSY: 'Busy',
      VERY_BUSY: 'Very busy',
    },
    entry: {
      OPEN: 'Open',
      LIMITED: 'Limited entry',
      PAUSED: 'Entry paused',
      CLOSED: 'Entry closed',
      UNKNOWN: 'Not sure',
    },
    urgency: {
      NORMAL: 'Today',
      URGENT: 'Within 1 hour',
    },
    status: {
      OPEN: 'Open',
      RESOLVED: 'Resolved',
      REMOVED: 'Hidden',
      EXPIRED: 'Closed',
    },
    source: {
      ON_SITE_NOW: 'Checked on site now',
      RECENT_EXPERIENCE: 'Recent experience',
      OFFICIAL_SOURCE: 'Official info',
      PERSONAL_OPINION: 'Personal opinion',
    },
    badge: {
      VERIFIED_TRAVELER: 'Verified traveler',
      VERIFIED_LOCAL: 'Verified local',
      VERIFIED_BOTH: 'Verified traveler · local',
    },
  },
  shared: {
    photo: 'On-site photo',
    photoAlt: (area) =>
      area === null
        ? 'Photo attached to topic'
        : `Photo attached to topic at ${area}`,
    loadErrorTitle: "We couldn't load the topic",
    reload: 'Reload',
    checkedAt: (time) => `Checked ${time}`,
    reportUser: (nickname) => `User ${nickname}`,
    pickPhoto: 'Choose photo',
    photoTooLarge: 'Please choose a photo under 10 MB.',
  },
  card: {
    answers: 'Answers',
  },
  feed: {
    filtersLabel: 'Filter by topic type',
    all: 'All',
    loadingLabel: 'Loading topics',
    loadErrorDescription: 'Check your connection and try again.',
    refetchFailed:
      "We couldn't refresh the topic list. What you see may be out of date.",
    emptyOpenTitle: 'No open topics yet',
    emptyResolvedTitle: 'No resolved topics yet',
    emptyOpenDescription:
      'Turn something important from the chat into a topic.',
    emptyResolvedDescription: 'Topics resolved by answers will show up here.',
    moreFailed: "We couldn't load more topics.",
    more: 'Show more topics',
  },
  composer: {
    errors: {
      OPEN_QUESTION_LIMIT_REACHED:
        'You can have up to 3 open topics in a room.',
      ROOM_PARTICIPANT_VERIFICATION_REQUIRED:
        'Please check that your traveler or local verification is still valid.',
      MESSAGE_ALREADY_PROMOTED: 'This message is already a topic.',
    },
    failed:
      "We couldn't create the topic. Check your connection and try again.",
    tooShort:
      'Please write at least 20 characters so others can understand the situation.',
    titleNew: 'New topic',
    titleFromMessage: 'Turn this message into a topic',
    description:
      'Describe a situation worth answering and resolving, with specific details.',
    categoryLegend: 'Topic type',
    urgencyLegend: 'When do you need an answer?',
    area: 'Area or place',
    optional: 'Optional',
    areaPlaceholder: 'e.g. Jeju Airport 1F, Jungmun in Seogwipo',
    content: 'Topic details',
    contentPlaceholder:
      "Share what's happening, what you've already checked, and when you need to decide.",
    photoHint: 'One photo that shows the situation · up to 10 MB',
    removePhoto: 'Remove',
    sourceMessage: 'Original message',
    safetyHelp:
      'If someone is in immediate danger, call 112 (police) or 119 (emergency) before waiting for answers.',
    submitting: 'Creating topic',
    submit: 'Create topic',
  },
  detail: {
    title: 'Topic',
    backLabel: (destination) => `${destination} help room`,
    loadingLabel: 'Loading topic',
    loadErrorDescription:
      'The topic may have been deleted, or your connection may be unstable.',
    offline:
      "Please check your internet connection. We'll reload this topic once you're back online.",
    reconnecting:
      "Reconnecting to live updates. We'll reload this topic once connected.",
    refetchFailed:
      "We couldn't refresh this topic. What you see may be out of date.",
    safetyTitle: 'Emergency info',
    closesBefore: 'closes ',
    closesAfter: '',
    reportQuestion: 'This topic',
    resolvedAccepted: 'The author accepted a helpful answer',
    resolvedWithoutAnswer: 'The author marked this as resolved',
    resolvedDefault: 'This topic has been resolved.',
    resolvedAt: (time) => `Resolved on ${time}.`,
    answersTitle: (count) => `Answers (${count})`,
    answersOrder: 'Oldest first',
    emptyTitle: 'No answers yet',
    emptyDescription:
      "We're staying connected. The first answer will show up here right away.",
  },
  live: {
    headlineWait: (min, max) => `${min}–${max} min wait`,
    headlineUpdate: 'On-site update',
    stale: 'Older on-site info',
    live: 'Live on-site info',
    agreementBefore: () => '',
    agreementCount: (count) => `${count}`,
    agreementAfter: (total) => ` of ${total} on-site reports agree`,
    staleStrong: 'No new reports in over 30 minutes.',
    staleRest: ' Share how it looks now in an answer below.',
    currentWait: 'Current wait',
    checking: 'Checking',
    crowd: 'Crowds',
    entry: 'Entry',
    recheck: 'Check again',
  },
  share: {
    shareLabel: 'Share to chat',
    reshareLabel: 'Share to chat again',
    sharingLabel: 'Sharing to chat',
    share: 'Share',
    reshare: 'Share again',
    sharing: 'Sharing',
    failed: "We couldn't send the topic.",
  },
  resolution: {
    failed: "We couldn't save the resolution. Please check your connection.",
    panelLabel: 'Resolve topic',
    title: 'If an answer helped, mark the topic resolved',
    description:
      'You can only accept once, and the topic stops taking new answers after that.',
    acceptBefore: 'Accept ',
    acceptAfter: "'s answer",
    resolveWithout: 'Mark resolved without an answer',
    selectedFallback: 'the selected local',
    confirmAccept: (nickname) => `Accept ${nickname}'s answer?`,
    confirmResolve: 'Resolve this topic without accepting an answer?',
    irreversible:
      "Once done, you can't change the accepted answer or reopen the topic.",
    saving: 'Saving…',
    acceptAndResolve: 'Accept and resolve',
    resolve: 'Resolve',
  },
  answerCard: {
    accepted: 'Accepted answer',
    removed: 'Hidden answer',
    profileLabel: (nickname) => `View ${nickname}'s public profile`,
    verifiedOn: (date) => `Verified ${date}`,
    photoCaption: 'On-site photo',
    observationLabel: 'On-site observation',
    wait: 'Wait',
    waitValue: (minutes) => `${minutes} min`,
    crowd: 'Crowds',
    entry: 'Entry',
    openSource: 'Open official source',
    reportAnswer: 'This answer',
  },
  answerForm: {
    errors: {
      ANSWER_LIMIT_REACHED: 'You can leave up to 3 answers on this topic.',
      QUESTION_EXPIRED: 'This topic closed while you were answering.',
      QUESTION_NOT_OPEN: 'This topic is already resolved or closed.',
      SOURCE_URL_REQUIRED:
        'Please enter the HTTPS address of the official source.',
      INVALID_SOURCE_URL: 'The source address must start with https://.',
      UPLOAD_TOO_LARGE: 'Please choose a photo under 10 MB.',
    },
    failed:
      "We couldn't send your answer. Check your connection and try again.",
    tooShort:
      'Please write at least 10 characters so travelers can understand the situation.',
    sourceUrlMissing: 'Please add the HTTPS address of the official source.',
    waitInvalid:
      'Enter the expected wait as a whole number from 0 to 1440 minutes (24 hours).',
    observationMissing:
      'Please share at least one of wait time, crowds, or entry status.',
    title: 'Leave an answer with a clear basis',
    description:
      'Saying what you checked yourself and when makes it easier for travelers to decide.',
    sourceLegend: 'Basis for your answer',
    sourceUrl: 'Official HTTPS address',
    observationLegend: 'What you see on site right now',
    waitLabel: 'Expected wait',
    minutes: 'min',
    crowdLabel: 'Crowds',
    entryLabel: 'Entry status',
    select: 'Select',
    entryOptions: {
      OPEN: 'Open',
      LIMITED: 'Limited entry',
      PAUSED: 'Paused',
      CLOSED: 'Entry closed',
      UNKNOWN: 'Not sure',
    },
    observationNote:
      'The time you send your answer is saved as the time you checked.',
    content: 'Your answer',
    contentPlaceholder:
      'Describe what you see now and what options the traveler has.',
    photoHint: 'Optional · up to 10 MB',
    reselect: 'Choose again',
    submitting: 'Sending answer',
    submit: 'Send answer',
  },
  hidden: {
    topic: 'This topic was hidden under our community rules.',
    answer: 'This answer was hidden under our community rules.',
  },
};
