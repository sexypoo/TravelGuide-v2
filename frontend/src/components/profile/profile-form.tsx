'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
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
} from '@/lib/api/profile';
import { AppIcon } from '@/components/common';
import styles from './profile.module.css';

interface ProfileFormProps {
  profile: OwnProfile;
}

interface ProfileErrors {
  nickname?: string;
  bio?: string;
}

type FormMessages = Messages['profile']['form'];

function validate(input: UpdateProfileInput, t: FormMessages): ProfileErrors {
  const errors: ProfileErrors = {};
  if (input.nickname.length < 2 || input.nickname.length > 20) {
    errors.nickname = t.nicknameInvalid;
  }
  if ((input.bio?.length ?? 0) > 300) {
    errors.bio = t.bioTooLong;
  }
  return errors;
}

function saveError(error: unknown, t: FormMessages): string {
  if (error instanceof ApiProblem && error.code === 'NICKNAME_ALREADY_EXISTS') {
    return t.nicknameTaken;
  }
  return actionableErrorMessage(error, t.saveFailed);
}

export function ProfileForm({ profile }: ProfileFormProps): React.JSX.Element {
  const router = useRouter();
  const messages = useMessages().profile;
  const t = messages.form;
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
        text: t.photoTypeInvalid,
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: t.photoTooLarge,
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
      setMessage({ type: 'success', text: t.photoChanged });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: saveError(error, t) });
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
      setMessage({ type: 'success', text: t.photoRemoved });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: saveError(error, t) });
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
    const nextErrors = validate(input, t);
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
      setMessage({ type: 'success', text: t.saved });
      setIsSaving(false);
      router.refresh();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: saveError(error, t) });
      setIsSaving(false);
    }
  }

  return (
    <form
      method="post"
      className={styles.form}
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <section className={styles.photo} aria-labelledby="profile-photo-title">
        <span className={styles.avatar}>
          {profileImageUrl === null ? (
            <span aria-hidden="true">
              {Array.from(nickname)[0] ?? t.avatarFallback}
            </span>
          ) : (
            // Authenticated media is intentionally loaded from the same-origin API.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileImageUrl} alt={t.currentPhotoAlt} />
          )}
        </span>
        <div className={styles.photoCopy}>
          <strong id="profile-photo-title">{t.photoTitle}</strong>
          <div className={styles.photoActions}>
            <label
              className={styles.secondary}
              data-disabled={isAvatarSaving || undefined}
            >
              <AppIcon name="image" />
              {isAvatarSaving ? t.photoSaving : t.photoPick}
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
                className={styles.textButton}
                type="button"
                disabled={isAvatarSaving}
                onClick={() => void handleAvatarRemove()}
              >
                {t.photoRemove}
              </button>
            )}
          </div>
          <small>{t.photoHint}</small>
        </div>
      </section>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          <label htmlFor="profile-nickname">{t.nickname}</label>
          <span>{Array.from(nickname).length}/20</span>
        </div>
        <input
          id="profile-nickname"
          className={styles.control}
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
          <p id="nickname-error" className={styles.fieldError}>
            {errors.nickname}
          </p>
        )}
      </div>

      <fieldset className={styles.styles}>
        <legend>
          <span className={styles.stylesLabel}>
            {t.travelStyles}
            <span aria-live="polite">
              {t.travelStylesCount(travelStyles.length)}
            </span>
          </span>
        </legend>
        <div className={styles.chips}>
          {TRAVEL_STYLES.map((style) => {
            const selected = travelStyles.includes(style);
            return (
              <button
                key={style}
                className={styles.chip}
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
                <span aria-hidden="true">{travelStyleEmojis[style]}</span>
                <span>{messages.travelStyles[style]}</span>
                {selected && <AppIcon name="check" />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          <label htmlFor="profile-bio">{t.bio}</label>
          <span>{Array.from(bio).length}/300</span>
        </div>
        <textarea
          id="profile-bio"
          className={styles.control}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={300}
          rows={5}
          placeholder={t.bioPlaceholder}
          aria-invalid={errors.bio !== undefined}
          aria-describedby={errors.bio === undefined ? 'bio-help' : 'bio-error'}
        />
        {errors.bio === undefined ? (
          <p id="bio-help" className={styles.help}>
            {t.bioHelp}
          </p>
        ) : (
          <p id="bio-error" className={styles.fieldError}>
            {errors.bio}
          </p>
        )}
      </div>

      {message !== undefined && (
        <p
          className={styles.message}
          data-tone={message.type}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          <AppIcon name={message.type === 'success' ? 'check' : 'alert'} />
          {message.text}
        </p>
      )}

      <button className={styles.primary} type="submit" disabled={isSaving}>
        {isSaving ? t.saving : t.submit}
      </button>
    </form>
  );
}
