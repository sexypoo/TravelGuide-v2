import type { Messages } from '../types';

export const verifications: Messages['verifications'] = {
  qualification: {
    approvedAction: 'View verification status',
    approvedBodyTraveler: (city: string): string =>
      `You can ask questions and get on-the-spot answers in the ${city} live help room.`,
    approvedBodyLocal: (city: string): string =>
      `You can answer with local info in the ${city} live help room.`,
    approvedTitleTraveler: (city: string): string =>
      `Verified as a traveler in ${city}`,
    approvedTitleLocal: (city: string): string =>
      `Verified as a local in ${city}`,
    pendingAction: 'Check verification status',
    pendingBody:
      'You can apply again for the same type once the review is done.',
    pendingTitleTraveler: 'Traveler verification in review',
    pendingTitleLocal: 'Local verification in review',
    startTravelerAction: 'Start traveler verification',
    startTravelerBody:
      'Have your travel dates and proof ready to ask questions.',
    startTravelerTitle: 'Traveling right now?',
    startLocalAction: 'Start local verification',
    startLocalBody:
      'Have your location and proof of residence ready to answer.',
    startLocalTitle: 'Do you live or study in that city?',
  },
  page: {
    title: 'Verification',
    description:
      'You need traveler verification to ask and local verification to answer.',
    backLabel: 'My profile',
    submittedTraveler: 'Traveler verification sent',
    submittedLocal: 'Local verification sent',
    submittedBody: 'It will show up here as soon as an admin reviews it.',
    mine: 'My verifications',
    emptyTitle: "You haven't applied for verification yet",
    emptyDescription: 'Choose how you want to take part below.',
    apply: 'Apply',
    travelerTitle: 'Traveler verification',
    travelerDescription:
      'Apply with your dates and booking proof. Once approved, you can ask questions.',
    localTitle: 'Local verification',
    localDescription:
      'Apply with your location and proof of residence or study. Once approved, you can answer.',
    privacyNotice:
      'Your proof and exact location are never public. Only admins use them for review.',
  },
  picker: {
    domestic: 'Destinations in Korea',
    temporary: 'Pilot cities',
    backLabel: 'Verification',
    rechoose: 'Choose another city',
    travelerTitle: 'Apply for traveler verification',
    travelerDescription:
      "Which city are you visiting? Once approved, you can ask questions in that city's help room during your trip.",
    travelerRow: (city: string): string => `Ask in the ${city} help room`,
    travelerFormTitle: (city: string): string =>
      `Traveler verification · ${city}`,
    travelerFormDescription: (city: string): string =>
      `Once approved, you can ask questions in the ${city} help room during your trip.`,
    localTitle: 'Apply for local verification',
    localDescription:
      "Which city do you live or study in? Once approved, you can answer in that city's help room.",
    localRow: (city: string): string => `Answer in the ${city} help room`,
    localFormTitle: (city: string): string => `Local verification · ${city}`,
    localFormDescription: (city: string): string =>
      `Once approved, you can answer travelers' questions in the ${city} help room.`,
  },
  status: {
    labels: {
      PENDING: 'In review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      REVOKED: 'Revoked',
      EXPIRED: 'Expired',
    },
    travelerTitle: (city: string): string => `Traveler verification · ${city}`,
    localTitle: (city: string): string => `Local verification · ${city}`,
    validDefault: 'Valid for 90 days after approval',
    validUntil: (date: string): string => `Valid until ${date}`,
    progressLabel: 'Verification progress',
    steps: ['Submitted', 'Review', 'Join in'],
    reasonTitle: 'What to fix',
    reapply: 'Apply again',
    revoked: 'For questions about your status, please contact the team.',
  },
  form: {
    prepareLabel: 'What to prepare',
    proofHint: 'JPEG, PNG, or PDF, up to 5 MB',
    proofPick: 'Choose file',
    proofChange: 'Change',
    sending: 'Sending application',
    proofMissing: 'Please choose a proof file.',
    proofType: 'Only JPEG, PNG, or PDF files can be used.',
    proofTooLarge: 'The proof file must be 5 MB or less.',
    consentMissing:
      'Please agree to how your proof and personal data are used.',
    submitFailed:
      "We couldn't send your application. Please try again shortly.",
    startDate: 'Start date',
    endDate: 'End date',
  },
  errors: {
    UPLOAD_TOO_LARGE: 'The proof file must be 5 MB or less.',
    UPLOAD_TYPE_NOT_ALLOWED: "Please check the file's content and format.",
    VERIFICATION_ALREADY_PENDING:
      'An application of the same type is already in review.',
    INVALID_TRAVEL_DATES: 'Please check your trip start and end dates.',
    TRAVEL_END_DATE_IN_PAST: 'Please choose an end date from today onward.',
    GPS_ACCURACY_TOO_LOW:
      'Your location is not precise enough. Try again somewhere open.',
    OUTSIDE_DESTINATION_AREA:
      "You're outside the verification area for this city.",
  },
  traveler: {
    datesMissing: 'Please choose your trip start and end dates.',
    datesOrder: "The start date can't be after the end date.",
    prepareDates: 'Trip dates',
    prepareDatesText: 'When you start and stop using the help room',
    prepareProof: 'Booking proof',
    prepareProofText: 'One flight or accommodation booking',
    datesTitle: 'Trip dates',
    datesDescription: 'Choose the dates you will use the help room.',
    proofTitle: 'Travel proof',
    proofDescription: 'Upload a flight or accommodation booking.',
    proofLabel: 'Choose proof file',
    note: 'Note for the admin (optional)',
    notePlaceholder: 'Anything that helps us check your proof.',
    consentTitle: 'I agree to proof review and use of my personal data.',
    consentBody:
      'Your file and dates are only used for verification review and are never shown to other users.',
    submit: 'Apply for traveler verification',
  },
  local: {
    locateStates: {
      idle: 'Not checked yet',
      locating: 'Checking your location',
      done: 'Location confirmed',
      error: "Couldn't check your location",
    },
    permissionDenied:
      'Location access is off. Please allow it in your browser settings.',
    timeout: 'Checking your location took too long. Try again somewhere open.',
    unavailable:
      "We can't find your location. Please check your device's location services.",
    unsupported: "This browser can't check your location.",
    lowAccuracy: (meters: number): string =>
      `Accuracy is ${meters} m. Try again somewhere open to get within 200 m.`,
    outside: (city: string): string =>
      `You're outside the ${city} verification area. Please try again from inside ${city}.`,
    inside: (city: string, meters: number): string =>
      `Confirmed inside ${city}. Accuracy ${meters} m`,
    locationFirst: (city: string): string =>
      `Please check your current location inside ${city} first.`,
    noteTooShort: (city: string): string =>
      `Please describe your connection to ${city} in at least 30 characters.`,
    prepareLocation: 'Current location',
    prepareLocationText: (city: string): string =>
      `One tap from inside ${city}`,
    prepareProof: 'Proof of ties',
    prepareProofText: 'One document showing residence, work, or study',
    locationTitle: 'Current location',
    locationDescription: (city: string, radiusKm: number): string =>
      `We only check that you're within ${radiusKm} km of central ${city}. Your coordinates are never shown.`,
    locationHint: 'Needs accuracy within 200 m',
    locating: 'Checking location…',
    locate: 'Check my location',
    relocate: 'Check again',
    tiesTitle: 'Your ties to the city',
    tiesDescription: 'Give the admin enough detail to confirm it.',
    proofType: 'Type of tie',
    proofTypes: {
      RESIDENCE: 'Residence',
      WORK: 'Work',
      STUDY: 'Study',
      OTHER: 'Other',
    },
    note: 'Your connection',
    notePlaceholder: (city: string): string =>
      `In at least 30 characters, tell us how long you've lived or studied in ${city} and which areas you know well.`,
    proofLabel: 'Choose proof of ties',
    consentTitle:
      'I agree to location and proof review and use of my personal data.',
    consentBody:
      'Your exact location and file are only used for verification review and are never shown to other users.',
    submit: 'Apply for local verification',
  },
};
