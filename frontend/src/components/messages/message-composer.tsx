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
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { mergeMessageIntoTimeline } from '@/lib/query/realtime-cache';
import type { GooglePlace } from '@/lib/api/places';
import { PlacePicker } from '@/components/places/place-picker';
import { AppIcon } from '@/components/common';
import styles from './messages.module.css';

type Attachment = 'image' | 'place' | null;

function messageError(error: unknown): string {
  if (error instanceof ApiProblem && error.code === 'UPLOAD_TOO_LARGE') {
    return '사진은 10MB 이하로 선택해 주세요.';
  }
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
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const actionMenu = useRef<HTMLDivElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const [content, setContent] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachment, setAttachment] = useState<Attachment>(null);
  const [image, setImage] = useState<File>();
  const [placePickerOpen, setPlacePickerOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace>();
  const [clientError, setClientError] = useState('');
  // isPending lags a tick behind mutate(), so guard repeated sends with a ref.
  const sending = useRef(false);

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
      if (attachment === 'place' && selectedPlace) {
        return createPlaceMessage(roomSlug, {
          googlePlaceId: selectedPlace.id,
          placeName: selectedPlace.name,
          address: selectedPlace.address ?? undefined,
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
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
      setSelectedPlace(undefined);
      setClientError('');
    },
    onSettled: () => {
      sending.current = false;
    },
  });

  function submit(): void {
    if (sending.current) return;
    if (attachment === 'image' && !image)
      return setClientError('보낼 사진을 선택해 주세요.');
    if (attachment === 'place' && !selectedPlace)
      return setClientError('보낼 장소를 지도에서 선택해 주세요.');
    if (attachment === null && content.trim().length === 0)
      return setClientError('공유할 내용을 입력해 주세요.');
    setClientError('');
    sending.current = true;
    mutation.mutate();
  }

  function closePlacePicker(): void {
    setPlacePickerOpen(false);
    window.requestAnimationFrame(() => addButton.current?.focus());
  }

  const error =
    clientError || (mutation.isError ? messageError(mutation.error) : '');

  return (
    <form
      className={styles.composer}
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className={styles.composerInner}>
        <label className="srOnly" htmlFor="room-message">
          방에 메시지 보내기
        </label>
        {attachment !== null && (
          <section
            className={styles.tray}
            aria-label={attachment === 'image' ? '사진 첨부' : '장소 공유'}
          >
            <button
              className={styles.trayClose}
              type="button"
              onClick={() => {
                setAttachment(null);
                setImage(undefined);
                setSelectedPlace(undefined);
              }}
              aria-label="첨부 닫기"
            >
              <AppIcon name="close" />
            </button>
            {attachment === 'image' ? (
              <>
                <strong>사진 보내기</strong>
                <p>JPEG, PNG, WebP · 최대 10MB</p>
                <button
                  className={styles.traySelect}
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
                  onChange={(event) => {
                    const nextImage = event.target.files?.[0];
                    if (nextImage && nextImage.size > 10 * 1024 * 1024) {
                      setClientError('사진은 10MB 이하로 선택해 주세요.');
                      event.target.value = '';
                      return;
                    }
                    setImage(nextImage);
                    setClientError('');
                  }}
                />
              </>
            ) : (
              <>
                <strong>장소 보내기</strong>
                <p>{selectedPlace?.address ?? 'Google 지도에서 선택한 장소'}</p>
                <div className={styles.placePreview}>
                  <span aria-hidden="true">
                    <AppIcon name="pin" />
                  </span>
                  <strong>{selectedPlace?.name}</strong>
                  <button
                    type="button"
                    onClick={() => setPlacePickerOpen(true)}
                  >
                    다른 장소
                  </button>
                </div>
              </>
            )}
          </section>
        )}
        {menuOpen && (
          <div
            ref={actionMenu}
            className={styles.menu}
            id="message-action-menu"
            role="menu"
            aria-label="메시지에 추가"
          >
            <header className={styles.menuHead}>
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
                className={`${styles.menuIcon} ${styles['menuIcon--image']}`}
                aria-hidden="true"
              >
                <AppIcon name="image" />
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
                setMenuOpen(false);
                setPlacePickerOpen(true);
              }}
            >
              <span
                className={`${styles.menuIcon} ${styles['menuIcon--place']}`}
                aria-hidden="true"
              >
                <AppIcon name="pin" />
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
                  className={`${styles.menuIcon} ${styles['menuIcon--topic']}`}
                  aria-hidden="true"
                >
                  <AppIcon name="topic" />
                </span>
                <span>
                  <strong>토픽</strong>
                  <small>답변이 필요한 이야기를 시작해요</small>
                </span>
              </button>
            )}
          </div>
        )}
        <div className={styles.inputRow}>
          <button
            ref={addButton}
            className={styles.round}
            type="button"
            aria-label="사진, 장소 또는 토픽 추가"
            aria-haspopup="menu"
            aria-controls="message-action-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <AppIcon name="add" />
          </button>
          <textarea
            ref={messageInput}
            id="room-message"
            className={styles.input}
            value={content}
            maxLength={500}
            rows={1}
            placeholder={
              attachment === 'image'
                ? '사진 설명을 덧붙여 보세요 (선택)'
                : attachment === 'place'
                  ? '장소에 대한 설명을 덧붙여 보세요 (선택)'
                  : '지금 상황을 나눠 보세요'
            }
            aria-invalid={error.length > 0}
            aria-describedby="room-message-help"
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || event.shiftKey) return;
              // Korean IME: this Enter only finishes composing a character.
              if (event.nativeEvent.isComposing || event.keyCode === 229)
                return;
              event.preventDefault();
              submit();
            }}
          />
          <button
            className={`${styles.round} ${styles.send}`}
            type="submit"
            disabled={mutation.isPending}
          >
            <AppIcon name="send" />
            <span className="srOnly">
              {mutation.isPending ? '메시지 보내는 중' : '메시지 보내기'}
            </span>
          </button>
        </div>
        <footer className={styles.help} id="room-message-help">
          <span className={styles.keyHint}>
            Enter 전송 · Shift+Enter 줄바꿈
          </span>
          <span>{Array.from(content).length}/500</span>
        </footer>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </div>
      {placePickerOpen && (
        <PlacePicker
          onClose={closePlacePicker}
          onSelect={(place) => {
            setSelectedPlace(place);
            setAttachment('place');
            setPlacePickerOpen(false);
            setClientError('');
            window.requestAnimationFrame(() => messageInput.current?.focus());
          }}
        />
      )}
    </form>
  );
}
