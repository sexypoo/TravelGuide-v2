'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import {
  updateOwnProfile,
  type OwnProfile,
  type TravelStyle,
  type UpdateProfileInput,
  TRAVEL_STYLES,
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
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [message, setMessage] = useState<
    { type: 'success' | 'error'; text: string } | undefined
  >();
  const [isSaving, setIsSaving] = useState(false);

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
                <AppIcon name={selected ? 'check' : 'add'} />
                {travelStyleLabels[style]}
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
            {message.type === 'success' ? <AppIcon name="check" /> : '!'}
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
