import type { Messages } from '../types';

export const travelTest: Messages['travelTest'] = {
  meta: {
    title: 'What kind of traveler are you? Travel Type Test',
    description:
      'Ten questions to find your travel type, from Dawn Climber to Market Raider. Takes a minute, no login needed.',
    ogTitle: 'What kind of traveler are you?',
    ogDescription:
      'Ten questions to find your travel type. One minute, no login.',
    resultTitle: (name: string): string =>
      `My travel type: ${name} · Travel Type Test`,
    resultDescription: (tagline: string): string =>
      `${tagline}. What kind of traveler are you? Find out in a one-minute test.`,
    resultOgTitle: (name: string): string => `My travel type: ${name}`,
    resultOgDescription: (tagline: string): string =>
      `${tagline}. What kind of traveler are you?`,
  },
  intro: {
    kicker: 'YeoJJU Travel Type Test',
    titleLine1: 'What kind of',
    titleLine2: 'traveler are you?',
    lede: 'Answer ten questions to find your travel type, then share it with friends.',
    meta: '1 minute · No login · 8 types',
    start: 'Start',
  },
  quiz: {
    calculating: 'Working out your result.',
    backToIntro: 'Back to the start',
    previous: 'Previous question',
    progress: 'Progress',
  },
  result: {
    you: 'My travel type is',
    traitsLabel: 'Traits of this type',
    matchTitle: 'Travels well with',
    ctaTitle: 'Stuck on a trip? Ask someone who knows the place right now',
    ctaText:
      'Every city has a help room where verified locals and travelers answer questions about what is happening right now.',
    ctaAgain: 'Take the test yourself',
    othersTitle: 'Browse all 8 types',
  },
  course: {
    title: (type: string, region: string): string =>
      `A day in ${region} for the ${type}`,
    regionsLabel: 'Choose a region',
    notice: 'A sample course picked by YeoJJU. Locals have not checked it yet.',
    askRoom: (region: string): string =>
      `Ask locals in the ${region} help room`,
  },
  share: {
    title: 'YeoJJU Travel Type Test',
    text: (name: string): string =>
      `My travel type: ${name}! What kind of traveler are you?`,
    copied: 'Link copied. Paste it to a friend.',
    shareFailed: "Couldn't share. Please copy the link from the address bar.",
    saved: 'Image saved. Post it to your story.',
    saveFailed: "Couldn't create the image. Please try again in a moment.",
    shareButton: 'Share result',
    saveButton: 'Save as image',
    saving: 'Creating…',
  },
  card: {
    you: 'My travel type is',
    footer: (host: string): string => `YeoJJU Travel Type Test · ${host}/test`,
    critterFailed: "Couldn't load the character image.",
    noCanvas: "This browser can't create images.",
    failed: "Couldn't create the image.",
  },
};
