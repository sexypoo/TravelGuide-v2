'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  createTravelRecord,
  deleteTravelRecord,
  listTravelRecords,
  updateTravelRecord,
  type SaveTravelRecordInput,
  type TravelRecord,
} from '@/lib/api/travel-records';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { AppIcon } from '@/components/common';
import styles from './profile.module.css';

const emptyInput: SaveTravelRecordInput = {
  title: '',
  destination: '',
  startedOn: '',
  endedOn: '',
  note: null,
};

function formatPeriod(record: TravelRecord): string {
  const format = new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const start = format.format(new Date(`${record.startedOn}T00:00:00.000Z`));
  const end = format.format(new Date(`${record.endedOn}T00:00:00.000Z`));
  return record.startedOn === record.endedOn ? start : `${start} – ${end}`;
}

export function TravelRecordsPanel(): React.JSX.Element {
  const client = useQueryClient();
  const records = useQuery({
    queryKey: queryKeys.travelRecords,
    queryFn: listTravelRecords,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [input, setInput] = useState<SaveTravelRecordInput>(emptyInput);
  const [formError, setFormError] = useState('');
  const save = useMutation({
    mutationFn: async (): Promise<void> => {
      if (editingId === undefined) await createTravelRecord(input);
      else await updateTravelRecord(editingId, input);
    },
    onSuccess: async () => {
      setInput(emptyInput);
      setEditingId(undefined);
      setIsFormOpen(false);
      setFormError('');
      await client.invalidateQueries({ queryKey: queryKeys.travelRecords });
    },
    onError: (error: unknown) =>
      setFormError(
        actionableErrorMessage(error, '여행 기록을 저장하지 못했어요.'),
      ),
  });
  const remove = useMutation({
    mutationFn: deleteTravelRecord,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.travelRecords }),
  });

  function openCreate(): void {
    setInput(emptyInput);
    setEditingId(undefined);
    setFormError('');
    setIsFormOpen(true);
  }

  function openEdit(record: TravelRecord): void {
    setInput({
      title: record.title,
      destination: record.destination,
      startedOn: record.startedOn,
      endedOn: record.endedOn,
      note: record.note,
    });
    setEditingId(record.id);
    setFormError('');
    setIsFormOpen(true);
  }

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setFormError('');
    if (input.endedOn < input.startedOn) {
      setFormError('여행 종료일은 시작일보다 빠를 수 없어요.');
      return;
    }
    save.mutate();
  }

  return (
    <section className={styles.section} aria-labelledby="travel-records-title">
      <header className={styles.sectionHeader}>
        <div>
          <h2 id="travel-records-title">나의 여행 기록</h2>
          <p>기억하고 싶은 여행을 짧게 남겨 두세요. 나에게만 보여요.</p>
        </div>
        <button className={styles.secondary} type="button" onClick={openCreate}>
          <AppIcon name="add" /> 기록 추가
        </button>
      </header>

      {isFormOpen && (
        <form className={styles.recordForm} onSubmit={submit}>
          <div className={styles.recordFormHeading}>
            <strong>
              {editingId === undefined ? '새 여행 기록' : '여행 기록 수정'}
            </strong>
            <button
              className={styles.textButton}
              type="button"
              aria-label="여행 기록 폼 닫기"
              onClick={() => setIsFormOpen(false)}
            >
              <AppIcon name="close" />
            </button>
          </div>
          <div className={styles.recordGrid}>
            <label className={styles.field}>
              기록 제목
              <input
                className={styles.control}
                required
                minLength={2}
                maxLength={80}
                value={input.title}
                placeholder="예: 봄날의 제주"
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              여행지
              <input
                className={styles.control}
                required
                minLength={2}
                maxLength={80}
                value={input.destination}
                placeholder="예: 제주"
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              시작일
              <input
                className={styles.control}
                required
                type="date"
                value={input.startedOn}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    startedOn: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              종료일
              <input
                className={styles.control}
                required
                type="date"
                min={input.startedOn || undefined}
                value={input.endedOn}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    endedOn: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label className={styles.field}>
            짧은 메모 (선택)
            <textarea
              className={styles.control}
              rows={3}
              maxLength={500}
              value={input.note ?? ''}
              placeholder="가장 기억에 남은 순간을 적어보세요."
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  note: event.target.value || null,
                }))
              }
            />
          </label>
          {formError && (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          )}
          <div className={styles.recordActions}>
            <button
              className={styles.textButton}
              type="button"
              onClick={() => setIsFormOpen(false)}
            >
              취소
            </button>
            <button
              className={styles.secondary}
              type="submit"
              disabled={save.isPending}
            >
              {save.isPending ? '저장 중' : '기록 저장'}
            </button>
          </div>
        </form>
      )}

      {records.isPending ? (
        <p className={styles.state}>여행 기록을 불러오는 중이에요.</p>
      ) : records.isError ? (
        <div className={styles.state} role="alert">
          <strong>기록을 불러오지 못했어요.</strong>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => void records.refetch()}
          >
            다시 시도
          </button>
        </div>
      ) : records.data.length === 0 ? (
        <p className={styles.state}>
          아직 기록이 없어요. 여행지와 날짜, 한 줄의 기억이면 충분해요.
        </p>
      ) : (
        <ol className={styles.rows}>
          {records.data.map((record) => (
            <li key={record.id}>
              <article className={styles.record}>
                <h3>{record.title}</h3>
                <time dateTime={record.startedOn}>{formatPeriod(record)}</time>
                <span className={styles.recordPlace}>{record.destination}</span>
                {record.note && <p>{record.note}</p>}
                <div>
                  <button
                    className={styles.textButton}
                    type="button"
                    onClick={() => openEdit(record)}
                  >
                    수정
                  </button>
                  <button
                    className={styles.textButton}
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(record.id)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
      {remove.isError && (
        <p className={styles.error} role="alert">
          {actionableErrorMessage(
            remove.error,
            '여행 기록을 삭제하지 못했어요.',
          )}
        </p>
      )}
    </section>
  );
}
