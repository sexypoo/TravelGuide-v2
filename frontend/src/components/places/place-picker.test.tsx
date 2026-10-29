import { fireEvent, render, screen } from '@testing-library/react';
import { searchPlaces, type GooglePlace } from '@/lib/api/places';
import { PlacePicker } from './place-picker';

jest.mock('../../lib/api/places', () => ({
  searchPlaces: jest.fn(),
}));

const searchPlacesMock = jest.mocked(searchPlaces);
const place: GooglePlace = {
  id: 'ChIJ-google-place',
  name: '동백식당',
  address: '제주시 바다로 1',
  latitude: 33.5,
  longitude: 126.5,
  googleMapsUri: 'https://maps.google.com/?cid=1',
  category: '한식당',
  businessStatus: 'OPERATIONAL',
  openNow: true,
};

describe('PlacePicker', () => {
  beforeEach(() => {
    searchPlacesMock.mockReset();
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  });

  it('searches, selects, and confirms a Google place', async () => {
    const onSelect = jest.fn();
    searchPlacesMock.mockResolvedValue([place]);
    render(<PlacePicker onClose={jest.fn()} onSelect={onSelect} />);

    fireEvent.change(screen.getByLabelText('장소 검색어'), {
      target: { value: '동백식당' },
    });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('제주시 바다로 1')).toBeInTheDocument();
    expect(searchPlacesMock).toHaveBeenCalledWith('동백식당', {
      latitude: 33.4996,
      longitude: 126.5312,
    });
    fireEvent.click(screen.getByRole('button', { name: /동백식당/ }));
    fireEvent.click(screen.getByRole('button', { name: '이 장소 보내기' }));
    expect(onSelect).toHaveBeenCalledWith(place);
  });

  it('shows a not-found state when a search returns no places', async () => {
    searchPlacesMock.mockResolvedValue([]);
    render(<PlacePicker onClose={jest.fn()} onSelect={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('장소 검색어'), {
      target: { value: '없는가게' },
    });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    expect(
      await screen.findByText(
        '‘없는가게’에 맞는 장소를 찾지 못했어요. 다른 이름이나 동네로 검색해 보세요.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('0곳')).toBeInTheDocument();
    expect(
      screen.queryByText('보내고 싶은 장소를 검색해 보세요.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('장소 이름을 입력하세요'),
    ).not.toBeInTheDocument();
  });

  it('clears previous results when a later search fails', async () => {
    searchPlacesMock
      .mockResolvedValueOnce([place])
      .mockRejectedValueOnce(new Error('network down'));
    render(<PlacePicker onClose={jest.fn()} onSelect={jest.fn()} />);

    const input = screen.getByLabelText('장소 검색어');
    fireEvent.change(input, { target: { value: '동백식당' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    expect(
      await screen.findByRole('button', { name: /동백식당/ }),
    ).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '바다카페' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '장소를 찾지 못했어요.',
    );
    expect(
      screen.queryByRole('button', { name: /동백식당/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/찾지 못했어요\. 다른 이름이나/)).toBeNull();
  });

  it('validates short searches and closes without making a request', () => {
    const onClose = jest.fn();
    render(<PlacePicker onClose={onClose} onSelect={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('장소 검색어'), {
      target: { value: '제' },
    });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    expect(
      screen.getByText('장소 이름을 두 글자 이상 입력해 주세요.'),
    ).toBeInTheDocument();
    expect(searchPlacesMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '장소 선택 닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders at the document level and closes from Escape or the backdrop', () => {
    const onClose = jest.fn();
    const view = render(
      <form data-testid="composer-host">
        <PlacePicker onClose={onClose} onSelect={jest.fn()} />
      </form>,
    );

    const dialog = screen.getByRole('dialog', { name: '장소 보내기' });
    expect(dialog.closest('form')).toBeNull();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = dialog.closest('.placePickerBackdrop');
    expect(backdrop).not.toBeNull();
    if (backdrop !== null) fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);

    view.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
