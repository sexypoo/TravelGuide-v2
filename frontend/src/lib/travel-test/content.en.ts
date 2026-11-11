import type { TravelTypeKey, TravelTypeText } from './content';

// English text for the travel type test (#80). Structure (colors, glyphs,
// styles, matches, and which type each answer scores) stays in `content.ts`;
// question options here follow the Korean options in the same order.

export type TravelTestQuestionText = {
  text: string;
  options: readonly [string, string, string, string];
};

export const TRAVEL_TYPE_TEXT_EN: Record<TravelTypeKey, TravelTypeText> = {
  dawn: {
    name: 'Dawn Climber',
    tagline: 'The trip starts when the sun comes up',
    description:
      'You wake up at five without an alarm. A cup of coffee on an empty summit is the whole reason to travel.',
    traits: [
      'Looks up sunrise times first',
      'Sneakers are a must',
      'Sleepy by 10 p.m.',
    ],
  },
  food: {
    name: 'Alley Foodie',
    tagline: "A locals' favorite beats a long line",
    description:
      'A destination is really just a place to eat. A menu without photos gets you excited.',
    traits: [
      'The restaurant list is the itinerary',
      'Five meals a day? Easy',
      'Follows every alley to the end',
    ],
  },
  slow: {
    name: 'Slow Wanderer',
    tagline: 'No itinerary, half a day by the window',
    description:
      'You love staying in one place for a long time. Two cafés make a full day of travel.',
    traits: [
      'Lingers in one spot',
      'Memories over photos',
      'Stopping is the plan',
    ],
  },
  mood: {
    name: 'Mood Collector',
    tagline: 'Happy to wait 30 minutes for the perfect shot',
    description:
      'You know when the light is best and never skip a gallery or a little gift shop. Your photo folder is your travel diary.',
    traits: [
      'Knows the golden hour',
      'Galleries and gift shops, always',
      'Packs a film camera',
    ],
  },
  night: {
    name: 'Night Owl Explorer',
    tagline: 'The trip begins after sunset',
    description:
      'Recharge by day, head out by night. You always pick a stay within walking distance of the action.',
    traits: [
      'Has a map of late-night spots',
      'No morning plans',
      'Stays near the nightlife',
    ],
  },
  spont: {
    name: 'Spontaneous Adventurer',
    tagline: 'Plans happen after landing',
    description:
      "Book a flight and a bed, and you're ready. Getting lost is part of the trip too.",
    traits: [
      'Rain? Buy a poncho and go',
      'A local tip means go now',
      'Figures out the bus on the spot',
    ],
  },
  plan: {
    name: 'Route Planner',
    tagline: 'Planning the route is half the fun',
    description:
      'Opening hours, travel times, even a plan B. Keeping the whole group happy is your job.',
    traits: [
      'Plan B always ready',
      'First in line 90% of the time',
      'Keeps the group happy',
    ],
  },
  market: {
    name: 'Market Raider',
    tagline: 'One suitcase is just for souvenirs',
    description:
      'Market day is the highlight of the trip. You try every sample to be polite, and you ship boxes home like a regular.',
    traits: [
      'Knows the market days',
      'Ships boxes home',
      'Tries every sample, politely',
    ],
  },
};

export const TRAVEL_TEST_QUESTION_TEXT_EN: readonly TravelTestQuestionText[] = [
  {
    text: 'Day one, 7 a.m. Where are you?',
    options: [
      'Already on a summit, watching the sunrise',
      'Still asleep. First stop: brunch',
      'In line for hot soup near my stay',
      'What should I do today? Opening the map',
    ],
  },
  {
    text: 'How do you plan a trip?',
    options: [
      'An hour-by-hour route',
      'Flight and a bed, done',
      'A packed list of places to eat',
      'A saved folder of photo spots',
    ],
  },
  {
    text: "You arrive and it's raining",
    options: [
      'Buy a poncho and head out anyway',
      'Watch the rain from a café with big windows',
      'Switch to galleries and exhibitions',
      'Plan B is already ready',
    ],
  },
  {
    text: 'What do you always bring home?',
    options: [
      'A box of market treats',
      'Film photos and postcards',
      'Nothing. Memories are enough',
      'A bottle of the local drink',
    ],
  },
  {
    text: '9 p.m. What are you up to?',
    options: [
      "Checking tomorrow's route at my stay",
      'Off to a late-night food tent for round two',
      'One more lap of the night market',
      'Asleep already. Sunrise tomorrow',
    ],
  },
  {
    text: 'How do you pick where to eat?',
    options: [
      'Whether locals go there',
      'A great nighttime vibe',
      'Whatever catches my eye',
      'No line, right on my route',
    ],
  },
  {
    text: 'Open your travel photos and you see…',
    options: [
      'Food, about 70% of it',
      'Mountains, sea, and sky',
      'Shots of me looking my best',
      'Not many photos, honestly',
    ],
  },
  {
    text: 'If you could ask a local just one thing?',
    options: [
      '"Which market do people here actually go to?"',
      '"Is there a walk without tourists?"',
      '"Anywhere good to go tonight?"',
      '"Is now a good time to catch the sunrise?"',
    ],
  },
  {
    text: "Who's your ideal travel buddy?",
    options: [
      "Honestly, I'm happiest solo",
      'A friend to raid markets with',
      'A friend who takes great photos of me',
      'Someone who trusts my schedule',
    ],
  },
  {
    text: 'Last day of the trip. What do you want to do?',
    options: [
      'One last sunrise',
      'Hit the market and leave with full hands',
      'Make the last night count',
      'Squeeze in every place I missed',
    ],
  },
];
