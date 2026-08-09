'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import {
  removeOwnProfileImage,
  updateOwnProfile,
  updateOwnProfileImage,
  type OwnProfile,
  type TravelStyle,
  type UpdateProfileInput,
  TRAVEL_STYLES,
  travelStyleEmojis,
  travelStyleLabels,
} from '@/lib/api/profile';
import { AppIcon } from '@/components/common';

interface ProfileFormProps {
  profile: OwnProfile;
}

interface ProfileErrors {
  nickname?: string;
  bio?: string;
}

function validate(input: UpdateProfileInput): ProfileErrors {
  const errors: ProfileErrors = {};
  if (input.nickname.length < 2 || input.nickname.length > 20) {
    errors.nickname = '닉네임은 공백을 제외하고 2~20자로 입력해 주세요.';
  }
  if ((input.bio?.length ?? 0) > 300) {
    errors.bio = '소개는 300자 이하로 입력해 주세요.';
  }
  return errors;
}

function saveError(error: unknown): string {
  if (error instanceof ApiProblem && error.code === 'NICKNAME_ALREADY_EXISTS') {
    return '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.';
  }
  return actionableErrorMessage(
    error,
    '프로필을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  );
}

export function ProfileForm({ profile }: ProfileFormProps): React.JSX.Element {
  const router = useRouter();
  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>(
    profile.travelStyles,
  );
  const [profileImageUrl, setProfileImageUrl] = useState(
    profile.profileImageUrl === null
      ? null
      : `${profile.profileImageUrl}?v=${encodeURIComponent(profile.updatedAt)}`,
  );
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [message, setMessage] = useState<
    { type: 'success' | 'error'; text: string } | undefined
  >();
  const [isSaving, setIsSaving] = useState(false);

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'JPEG, PNG, WebP 사진만 사용할 수 있어요.',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: '프로필 사진은 5MB 이하로 골라주세요.',
      });
      return;
    }
    setIsAvatarSaving(true);
    setMessage(undefined);
    try {
      const updated = await updateOwnProfileImage(file);
      setProfileImageUrl(
        updated.profileImageUrl === null
          ? null
          : `${updated.profileImageUrl}?v=${encodeURIComponent(updated.updatedAt)}`,
      );
      setMessage({ type: 'success', text: '프로필 사진을 바꿨어요.' });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: saveError(error) });
    } finally {
      setIsAvatarSaving(false);
    }
  }

  async function handleAvatarRemove(): Promise<void> {
    setIsAvatarSaving(true);
    setMessage(undefined);
    try {
      await removeOwnProfileImage();
      setProfileImageUrl(null);
      setMessage({ type: 'success', text: '프로필 사진을 지웠어요.' });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: saveError(error) });
    } finally {
      setIsAvatarSaving(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setMessage(undefined);

    const input: UpdateProfileInput = {
      nickname: nickname.trim(),
      bio: bio.trim().length === 0 ? null : bio.trim(),
      travelStyles,
    };
    const nextErrors = validate(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateOwnProfile(input);
      setNickname(updated.nickname);
      setBio(updated.bio ?? '');
      setTravelStyles(updated.travelStyles);
      setMessage({ type: 'success', text: '프로필을 저장했습니다.' });
      setIsSaving(false);
      router.refresh();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: saveError(error) });
      setIsSaving(false);
    }
  }

  return (
    <form
      className="profileForm"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <section
        className="profilePhotoEditor"
        aria-labelledby="profile-photo-title"
      >
        <div className="profilePhotoEditor__preview">
          {profileImageUrl === null ? (
            <span aria-hidden="true">{Array.from(nickname)[0] ?? '여'}</span>
          ) : (
            // Authenticated media is intentionally loaded from the same-origin API.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileImageUrl} alt="현재 프로필 사진" />
          )}
        </div>
        <div className="profilePhotoEditor__copy">
          <strong id="profile-photo-title">프로필 사진</strong>
          <p>얼굴이나 여행의 분위기가 잘 보이는 정사각형 사진이 좋아요.</p>
          <div>
            <label className={isAvatarSaving ? 'isDisabled' : ''}>
              <AppIcon name="image" />
              {isAvatarSaving ? '사진 저장 중' : '사진 선택'}
              <input
                className="srOnly"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isAvatarSaving}
                onChange={(event) => void handleAvatarChange(event)}
              />
            </label>
            {profileImageUrl !== null && (
              <button
                type="button"
                disabled={isAvatarSaving}
                onClick={() => void handleAvatarRemove()}
              >
                사진 지우기
              </button>
            )}
          </div>
          <small>JPEG, PNG, WebP · 최대 5MB</small>
        </div>
      </section>

      <div className="profileField">
        <div>
          <label htmlFor="profile-nickname">닉네임</label>
          <span>{Array.from(nickname).length}/20</span>
        </div>
        <input
          id="profile-nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={20}
          autoComplete="nickname"
          aria-invalid={errors.nickname !== undefined}
          aria-describedby={
            errors.nickname === undefined ? undefined : 'nickname-error'
          }
        />
        {errors.nickname !== undefined && (
          <p id="nickname-error" className="fieldError">
            {errors.nickname}
          </p>
        )}
      </div>

      <fieldset className="profileTravelStyles">
        <legend>
          나의 여행 스타일 <span>{travelStyles.length}/5</span>
        </legend>
        <p>여행 취향을 최대 5개까지 골라주세요.</p>
        <div>
          {TRAVEL_STYLES.map((style) => {
            const selected = travelStyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                aria-pressed={selected}
                disabled={!selected && travelStyles.length >= 5}
                onClick={() =>
                  setTravelStyles((current) =>
                    selected
                      ? current.filter((item) => item !== style)
                      : [...current, style],
                  )
                }
              >
                <span className="profileTravelStyles__emoji" aria-hidden="true">
                  {travelStyleEmojis[style]}
                </span>
                <span>{travelStyleLabels[style]}</span>
                {selected && <AppIcon name="check" />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="profileField">
        <div>
          <label htmlFor="profile-bio">짧은 소개</label>
          <span>{Array.from(bio).length}/300</span>
        </div>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={300}
          rows={5}
          placeholder="다른 사용자에게 보여줄 간단한 소개를 적어 주세요."
          aria-invalid={errors.bio !== undefined}
          aria-describedby={errors.bio === undefined ? 'bio-help' : 'bio-error'}
        />
        {errors.bio === undefined ? (
          <p id="bio-help" className="fieldHelp">
            이메일과 인증 증빙은 공개되지 않아요.
          </p>
        ) : (
          <p id="bio-error" className="fieldError">
            {errors.bio}
          </p>
        )}
      </div>

      {message !== undefined && (
        <div
          className={`profileMessage profileMessage--${message.type}`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          <span aria-hidden="true">
            <AppIcon name={message.type === 'success' ? 'check' : 'alert'} />
          </span>
          {message.text}
        </div>
      )}

      <button className="profileSaveButton" type="submit" disabled={isSaving}>
        {isSaving ? '저장 중' : '변경 내용 저장'}
      </button>
    </form>
  );
}
