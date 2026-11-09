import type { Messages } from '../types';

function placeCount(count: number): string {
  return count === 1 ? '1 place' : `${count} places`;
}

export const places: Messages['places'] = {
  noAddress: 'No address',
  reload: 'Reload',
  nearby: {
    title: 'Nearby',
    description: 'Restaurants open now within 1.5 km of you, nearest first.',
    locationDenied:
      'Location access is off. Allow it in your browser settings.',
    locationTimeout:
      'Finding your location took too long. Try again somewhere more open.',
    locationUnavailable:
      "We can't find your location. Check your device's location services.",
    mapLoadFailed:
      "We couldn't load the map. You can still see nearby restaurants in the list.",
    noGeolocation: "This browser can't share your current location.",
    searchFailed: "We couldn't find nearby restaurants.",
    locateLabel: 'Search from your location',
    locateHeading: 'Search from where you are',
    locateDescription:
      "We'll ask for location access when you tap the button. Your location is only used for this search and never saved.",
    searching: 'Looking nearby…',
    searchAgain: 'Search again from here',
    searchStart: 'Show what’s nearby',
    mapUnavailableTitle: "We can't show the map",
    mapUnavailableDescription:
      'You can still see nearby restaurants in the list.',
    mapLabel: 'Map of restaurants open near you',
    idleTitle: "You haven't searched yet",
    idleDescription:
      'Tap "Show what’s nearby" and nearby restaurants will appear here.',
    loadingList: 'Finding nearby restaurants…',
    listFailedTitle: "We couldn't load the list",
    listFailedDescription: 'Check the message above and search again.',
    emptyTitle: 'No restaurants open nearby',
    emptyDescription:
      'Nothing is open within 1.5 km. Move a little and search again.',
    resultsHeading: 'Nearest first',
    resultsCount: placeCount,
    openInGoogleMaps: (name: string): string => `View ${name} on Google Maps`,
  },
  favorite: {
    save: 'Save',
    saved: 'Saved',
    saveLabel: (name: string): string => `Save ${name}`,
    removeLabel: (name: string): string => `Unsave ${name}`,
    saving: 'Saving',
    saveFailed: "We couldn't save this place.",
  },
  saved: {
    title: 'Saved places',
    backLabel: 'Back to profile',
    description: 'Places recommended to you in live rooms that you saved.',
    loading: 'Loading your saved places.',
    loadFailedTitle: "We couldn't load your saved places",
    loadFailedDescription: 'Check your connection and try again.',
    emptyTitle: 'No saved places yet',
    emptyDescription: 'Tap the save button on a place card in a live room.',
    listLabel: 'Saved places',
    viewOnMap: 'View on map',
    remove: 'Unsave',
    removeFailed: "We couldn't remove this place.",
  },
  picker: {
    title: 'Send a place',
    description: 'Search by name, check it on the map, then share it.',
    close: 'Close place picker',
    searchPlaceholder: 'Search restaurants, cafes, sights',
    searchLabel: 'Place search',
    search: 'Search',
    mapLoadFailed: "We couldn't load the map.",
    queryTooShort: 'Enter at least 2 characters of the place name.',
    searchFailed: "We couldn't find that place.",
    resultsTitle: 'Results',
    resultsCount: placeCount,
    resultsHint: 'Enter a place name',
    searching: 'Searching for places…',
    noResults: (query: string): string =>
      `No places match “${query}”. Try another name or neighborhood.`,
    startHint: 'Search for the place you want to send.',
    openNow: 'Open',
    closed: 'Closed',
    mapTitle: 'Map preview',
    mapHint: 'The place you pick shows up here',
    mapNoKey: 'Set a map API key to show the map.',
    mapLabel: 'Place map',
    noSelection: 'No place selected yet',
    noSelectionHint: 'Pick a place from the results to send it right away.',
    select: 'Choose a place',
    send: 'Send this place',
  },
};
