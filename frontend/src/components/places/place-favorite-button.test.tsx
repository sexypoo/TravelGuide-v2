import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PlaceFavorite } from '@/lib/api/place-favorites';
import { PlaceFavoriteButton } from './place-favorite-button';

const mockGetFavorites = jest.fn<Promise<PlaceFavorite[]>, []>();
const mockSaveFavorite = jest.fn<Promise<PlaceFavorite>, [string]>();
const mockRemoveFavorite = jest.fn<Promise<void>, [string]>();

jest.mock('../../lib/api/place-favorites', () => ({
  getPlaceFavorites: () => mockGetFavorites(),
  savePlaceFavorite: (messageId: string) => mockSaveFavorite(messageId),
  removePlaceFavorite: (favoriteId: string) => mockRemoveFavorite(favoriteId),
}));

const favorite: PlaceFavorite = {
  id: 'favorite-1',
  sourceMessageId: 'message-1',
  name: '동백식당',
  address: '제주시 바다로 1',
  latitude: 33.5,
  longitude: 126.5,
  createdAt: '2026-08-08T00:00:00.000Z',
};

function renderButton(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <PlaceFavoriteButton messageId="message-1" placeName="동백식당" />
    </QueryClientProvider>,
  );
}

describe('PlaceFavoriteButton', () => {
  let favorites: PlaceFavorite[];

  beforeEach(() => {
    favorites = [];
    mockGetFavorites.mockImplementation(async () => favorites);
    mockSaveFavorite.mockImplementation(async () => {
      favorites = [favorite];
      return favorite;
    });
    mockRemoveFavorite.mockImplementation(async () => {
      favorites = [];
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('saves and removes a recommended place with explicit pressed state', async () => {
    renderButton();
    const save = await screen.findByRole('button', {
      name: '동백식당 찜하기',
    });
    await waitFor(() => expect(save).toBeEnabled());
    expect(save).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(save);

    await waitFor(() =>
      expect(mockSaveFavorite).toHaveBeenCalledWith('message-1'),
    );
    const remove = await screen.findByRole('button', {
      name: '동백식당 찜 해제',
    });
    expect(remove).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(remove);

    await waitFor(() =>
      expect(mockRemoveFavorite).toHaveBeenCalledWith('favorite-1'),
    );
  });
});
