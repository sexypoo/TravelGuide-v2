'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  createImageMessage,
  createMessage,
  createPlaceMessage,
  type ChatMessage,
  type MessagePage,
} from '@/lib/api/messages';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { mergeMessageIntoTimeline } from '@/lib/query/realtime-cache';

type Attachment = 'image' | 'place' | null;

function messageError(error: unknown): string {
  return actionableErrorMessage(
    error,
    '메시지를 보내지 못했습니다. 연결을 확인하고 다시 시도해 주세요.',
  );
}

export function MessageComposer({
  roomSlug,
  onCreateTopic,
}: {
  roomSlug: string;
  onCreateTopic?: () => void;
}): React.JSX.Element {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const actionMenu = useRef<HTMLDivElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const [content, setContent] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachment, setAttachment] = useState<Attachment>(null);
  const [image, setImage] = useState<File>();
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
  const [placeMode, setPlaceMode] = useState<'device' | 'manual'>('device');
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [locating, setLocating] = useState(false);
  const [clientError, setClientError] = useState('');
  const manualCoordinates = {
    latitude: Number(manualLatitude),
    longitude: Number(manualLongitude),
  };
  const validManualCoordinates =
    manualLatitude.trim() !== '' &&
    manualLongitude.trim() !== '' &&
    manualCoordinates.latitude >= -90 &&
    manualCoordinates.latitude <= 90 &&
    manualCoordinates.longitude >= -180 &&
    manualCoordinates.longitude <= 180;
  const selectedCoordinates =
    placeMode === 'device'
      ? coordinates
      : validManualCoordinates
        ? manualCoordinates
        : undefined;

  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeMenu(event: MouseEvent): void {
      const target = event.target;
      if (
        target instanceof Node &&
        !actionMenu.current?.contains(target) &&
        !addButton.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    function closeWithEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        addButton.current?.focus();
      }
    }
    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [menuOpen]);

  const mutation = useMutation({
    mutationFn: async (): Promise<ChatMessage> => {
      if (attachment === 'image' && image)
        return createImageMessage(roomSlug, image, content);
      if (attachment === 'place' && selectedCoordinates) {
        return createPlaceMessage(roomSlug, {
          placeName: placeName.trim(),
          address: address.trim() || undefined,
          latitude: selectedCoordinates.latitude,
          longitude: selectedCoordinates.longitude,
          note: content.trim() || undefined,
        });
      }
      return createMessage(roomSlug, content.trim());
    },
    onSuccess: (message) => {
      queryClient.setQueryData<InfiniteData<MessagePage>>(
        queryKeys.roomMessages(roomSlug),
        (current) => mergeMessageIntoTimeline(current, message),
      );
      setContent('');
      setImage(undefined);
      setAttachment(null);
      setPlaceName('');
      setAddress('');
      setCoordinates(undefined);
      setManualLatitude('');
      setManualLongitude('');
      setClientError('');
    },
  });

  function submit(): void {
    if (attachment === 'image' && !image)
      return setClientError('보낼 사진을 선택해 주세요.');
    if (attachment === 'place' && !placeName.trim())
      return setClientError('장소 이름을 입력해 주세요.');
    if (attachment === 'place' && !selectedCoordinates)
      return setClientError(
        placeMode === 'device'
          ? '현재 위치 공유를 먼저 허용해 주세요.'
          : '유효한 위도와 경도를 입력해 주세요.',
      );
    if (attachment === null && content.trim().length === 0)
      return setClientError('공유할 내용을 입력해 주세요.');
    setClientError('');
    mutation.mutate();
  }

  function requestLocation(): void {
    if (!navigator.geolocation)
      return setClientError('이 브라우저에서는 위치 공유를 지원하지 않아요.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setLocating(false);
        setClientError('');
      },
      () => {
        setLocating(false);
        setClientError('위치 권한을 허용한 뒤 다시 시도해 주세요.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const error =
    clientError || (mutation.isError ? messageError(mutation.error) : '');

  return (
    <form
      className="messageComposer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label htmlFor="room-message">방에 메시지 보내기</label>
      {attachment !== null && (
        <section
          className="messageAttachmentTray"
          aria-label={attachment === 'image' ? '사진 첨부' : '장소 공유'}
        >
          <button
            className="messageAttachmentTray__close"
            type="button"
            onClick={() => {
              setAttachment(null);
              setImage(undefined);
              setCoordinates(undefined);
            }}
            aria-label="첨부 닫기"
          >
            ×
          </button>
          {attachment === 'image' ? (
            <>
              <strong>사진 보내기</strong>
              <p>JPEG, PNG, WebP · 최대 10MB</p>
              <button
                className="attachmentSelectButton"
                type="button"
                onClick={() => fileInput.current?.click()}
              >
                {image ? image.name : '사진 선택'}
              </button>
              <input
                ref={fileInput}
                className="srOnly"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setImage(event.target.files?.[0])}
              />
            </>
          ) : (
            <>
              <strong>장소 보내기</strong>
              <p>이 방의 인증된 참여자에게 선택한 좌표가 공유됩니다.</p>
              <div
                className="placeModeSwitch"
                role="group"
                aria-label="장소 좌표 선택 방식"
              >
                <button
                  type="button"
                  aria-pressed={placeMode === 'device'}
                  onClick={() => setPlaceMode('device')}
                >
                  현재 위치
                </button>
                <button
                  type="button"
                  aria-pressed={placeMode === 'manual'}
                  onClick={() => setPlaceMode('manual')}
                >
                  다른 장소 지정
                </button>
              </div>
              <div className="placeAttachmentFields">
                <input
                  value={placeName}
                  maxLength={100}
                  placeholder="장소 이름"
                  aria-label="장소 이름"
                  onChange={(event) => setPlaceName(event.target.value)}
                />
                <input
                  value={address}
                  maxLength={200}
                  placeholder="주소 또는 찾는 방법 (선택)"
                  aria-label="장소 주소"
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
              {placeMode === 'device' ? (
                <button
                  className={`locationConsentButton${coordinates ? ' locationConsentButton--ready' : ''}`}
                  type="button"
                  onClick={requestLocation}
                  disabled={locating}
                >
                  <span aria-hidden="true">⌖</span>{' '}
                  {locating
                    ? '현재 위치 확인 중…'
                    : coordinates
                      ? '현재 위치 확인됨'
                      : '현재 위치 공유하기'}
                </button>
              ) : (
                <div className="manualCoordinateFields">
                  <label>
                    위도
                    <input
                      type="number"
                      min="-90"
                      max="90"
                      step="0.000001"
                      value={manualLatitude}
                      onChange={(event) =>
                        setManualLatitude(event.target.value)
                      }
                      placeholder="33.4589"
                    />
                  </label>
                  <label>
                    경도
                    <input
                      type="number"
                      min="-180"
                      max="180"
                      step="0.000001"
                      value={manualLongitude}
                      onChange={(event) =>
                        setManualLongitude(event.target.value)
                      }
                      placeholder="126.9425"
                    />
                  </label>
                  <small>
                    지도에서 확인한 좌표를 입력해 다른 장소를 지정할 수 있어요.
                  </small>
                </div>
              )}
            </>
          )}
        </section>
      )}
      {menuOpen && (
        <div
          ref={actionMenu}
          className="messageActionMenu"
          id="message-action-menu"
          role="menu"
          aria-label="메시지에 추가"
        >
          <header>
            <span>여행 도구</span>
            <small>대화에 무엇을 더할까요?</small>
          </header>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAttachment('image');
              setMenuOpen(false);
            }}
          >
            <span
              className="messageActionMenu__icon messageActionMenu__icon--image"
              aria-hidden="true"
            >
              ▧
            </span>
            <span>
              <strong>사진</strong>
              <small>현장 모습을 함께 보내요</small>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAttachment('place');
              setMenuOpen(false);
            }}
          >
            <span
              className="messageActionMenu__icon messageActionMenu__icon--place"
              aria-hidden="true"
            >
              ⌖
            </span>
            <span>
              <strong>장소</strong>
              <small>현재 위치와 장소를 알려요</small>
            </span>
          </button>
          {onCreateTopic && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setAttachment(null);
                onCreateTopic();
              }}
            >
              <span
                className="messageActionMenu__icon messageActionMenu__icon--topic"
                aria-hidden="true"
              >
                ⌁
              </span>
              <span>
                <strong>토픽</strong>
                <small>답변이 필요한 이야기를 시작해요</small>
              </span>
            </button>
          )}
        </div>
      )}
      <div className="messageComposer__inputRow">
        <button
          ref={addButton}
          className="messageAddButton"
          type="button"
          aria-label="사진, 장소 또는 토픽 추가"
          aria-haspopup="menu"
          aria-controls="message-action-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">+</span>
        </button>
        <textarea
          id="room-message"
          value={content}
          maxLength={500}
          rows={2}
          placeholder={
            attachment === 'image'
              ? '사진 설명을 덧붙여 보세요 (선택)'
              : attachment === 'place'
                ? '장소에 대한 설명을 덧붙여 보세요 (선택)'
                : '지금 본 것, 궁금한 것, 도움이 될 정보를 나눠보세요'
          }
          aria-invalid={error.length > 0}
          aria-describedby="room-message-help"
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (!mutation.isPending) submit();
            }
          }}
        />
        <button
          className="messageSendButton"
          type="submit"
          disabled={mutation.isPending}
        >
          <span aria-hidden="true">↗</span>
          <span className="srOnly">
            {mutation.isPending ? '메시지 보내는 중' : '메시지 보내기'}
          </span>
        </button>
      </div>
      <footer id="room-message-help">
        <span>Enter 전송 · Shift+Enter 줄바꿈</span>
        <span>{Array.from(content).length}/500</span>
      </footer>
      {error && (
        <p role="alert" className="composerError">
          {error}
        </p>
      )}
    </form>
  );
}
