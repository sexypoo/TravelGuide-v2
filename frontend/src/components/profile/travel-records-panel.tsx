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
    <section className="travelRecords" aria-labelledby="travel-records-title">
      <header>
        <div>
          <p>MY JOURNEY</p>
          <h2 id="travel-records-title">나의 여행 기록</h2>
          <span>기억하고 싶은 여행을 짧게 남겨두세요. 나에게만 보여요.</span>
        </div>
        <button className="iconTextControl" type="button" onClick={openCreate}>
          <AppIcon name="add" /> 기록 추가
        </button>
      </header>

      {isFormOpen && (
        <form className="travelRecordForm" onSubmit={submit}>
          <div className="travelRecordForm__heading">
            <strong>
              {editingId === undefined ? '새 여행 기록' : '여행 기록 수정'}
            </strong>
            <button
              className="iconOnlyControl"
              type="button"
              aria-label="여행 기록 폼 닫기"
              onClick={() => setIsFormOpen(false)}
            >
              <AppIcon name="close" />
            </button>
          </div>
          <div className="travelRecordForm__grid">
            <label>
              기록 제목
              <input
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
            <label>
              여행지
              <input
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
            <label>
              시작일
              <input
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
            <label>
              종료일
              <input
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
          <label>
            짧은 메모 <span>선택</span>
            <textarea
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
            <p className="travelRecordError" role="alert">
              {formError}
            </p>
          )}
          <footer>
            <button type="button" onClick={() => setIsFormOpen(false)}>
              취소
            </button>
            <button type="submit" disabled={save.isPending}>
              {save.isPending ? '저장 중' : '기록 저장'}
            </button>
          </footer>
        </form>
      )}

      {records.isPending ? (
        <div className="travelRecordsState">여행 기록을 불러오는 중이에요.</div>
      ) : records.isError ? (
        <div className="travelRecordsState" role="alert">
          <strong>기록을 불러오지 못했어요.</strong>
          <button type="button" onClick={() => void records.refetch()}>
            다시 시도
          </button>
        </div>
      ) : records.data.length === 0 ? (
        <div className="travelRecordsState travelRecordsState--empty">
          <AppIcon name="sparkle" />
          <strong>첫 여행을 기록해 보세요</strong>
          <p>여행지와 날짜, 한 줄의 기억이면 충분해요.</p>
        </div>
      ) : (
        <ol className="travelRecordTimeline">
          {records.data.map((record) => (
            <li key={record.id}>
              <span className="travelRecordTimeline__dot" aria-hidden="true" />
              <article>
                <header>
                  <div>
                    <small>{record.destination}</small>
                    <h3>{record.title}</h3>
                  </div>
                  <time dateTime={record.startedOn}>
                    {formatPeriod(record)}
                  </time>
                </header>
                {record.note && <p>{record.note}</p>}
                <footer>
                  <button type="button" onClick={() => openEdit(record)}>
                    수정
                  </button>
                  <button
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(record.id)}
                  >
                    삭제
                  </button>
                </footer>
              </article>
            </li>
          ))}
        </ol>
      )}
      {remove.isError && (
        <p className="travelRecordError" role="alert">
          {actionableErrorMessage(
            remove.error,
            '여행 기록을 삭제하지 못했어요.',
          )}
        </p>
      )}
    </section>
  );
}
