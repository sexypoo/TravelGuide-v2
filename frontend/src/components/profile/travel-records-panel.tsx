'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { useLocale, useMessages } from '@/i18n/client';
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
import { intlLocale } from '@/lib/verifications/presentation';
import { AppIcon } from '@/components/common';
import styles from './profile.module.css';

const emptyInput: SaveTravelRecordInput = {
  title: '',
  destination: '',
  startedOn: '',
  endedOn: '',
  note: null,
};

function formatPeriod(record: TravelRecord, locale: Locale): string {
  const format = new Intl.DateTimeFormat(intlLocale(locale), {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const start = format.format(new Date(`${record.startedOn}T00:00:00.000Z`));
  const end = format.format(new Date(`${record.endedOn}T00:00:00.000Z`));
  return record.startedOn === record.endedOn ? start : `${start} – ${end}`;
}

export function TravelRecordsPanel(): React.JSX.Element {
  const messages = useMessages();
  const t = messages.profile.records;
  const locale = useLocale();
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
      setFormError(actionableErrorMessage(error, t.saveFailed)),
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
      setFormError(t.endBeforeStart);
      return;
    }
    save.mutate();
  }

  return (
    <section className={styles.section} aria-labelledby="travel-records-title">
      <header className={styles.sectionHeader}>
        <div>
          <h2 id="travel-records-title">{t.title}</h2>
          <p>{t.description}</p>
        </div>
        <button className={styles.secondary} type="button" onClick={openCreate}>
          <AppIcon name="add" /> {t.add}
        </button>
      </header>

      {isFormOpen && (
        <form method="post" className={styles.recordForm} onSubmit={submit}>
          <div className={styles.recordFormHeading}>
            <strong>
              {editingId === undefined ? t.newTitle : t.editTitle}
            </strong>
            <button
              className={styles.textButton}
              type="button"
              aria-label={t.closeForm}
              onClick={() => setIsFormOpen(false)}
            >
              <AppIcon name="close" />
            </button>
          </div>
          <div className={styles.recordGrid}>
            <label className={styles.field}>
              {t.recordTitle}
              <input
                className={styles.control}
                required
                minLength={2}
                maxLength={80}
                value={input.title}
                placeholder={t.recordTitlePlaceholder}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              {t.destination}
              <input
                className={styles.control}
                required
                minLength={2}
                maxLength={80}
                value={input.destination}
                placeholder={t.destinationPlaceholder}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              {t.startedOn}
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
              {t.endedOn}
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
            {t.note}
            <textarea
              className={styles.control}
              rows={3}
              maxLength={500}
              value={input.note ?? ''}
              placeholder={t.notePlaceholder}
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
              {messages.common.cancel}
            </button>
            <button
              className={styles.secondary}
              type="submit"
              disabled={save.isPending}
            >
              {save.isPending ? t.saving : t.save}
            </button>
          </div>
        </form>
      )}

      {records.isPending ? (
        <p className={styles.state}>{t.loading}</p>
      ) : records.isError ? (
        <div className={styles.state} role="alert">
          <strong>{t.loadFailed}</strong>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => void records.refetch()}
          >
            {messages.common.retry}
          </button>
        </div>
      ) : records.data.length === 0 ? (
        <p className={styles.state}>{t.empty}</p>
      ) : (
        <ol className={styles.rows}>
          {records.data.map((record) => (
            <li key={record.id}>
              <article className={styles.record}>
                <h3>{record.title}</h3>
                <time dateTime={record.startedOn}>
                  {formatPeriod(record, locale)}
                </time>
                <span className={styles.recordPlace}>{record.destination}</span>
                {record.note && <p>{record.note}</p>}
                <div>
                  <button
                    className={styles.textButton}
                    type="button"
                    onClick={() => openEdit(record)}
                  >
                    {t.edit}
                  </button>
                  <button
                    className={styles.textButton}
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(record.id)}
                  >
                    {t.remove}
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
      {remove.isError && (
        <p className={styles.error} role="alert">
          {actionableErrorMessage(remove.error, t.deleteFailed)}
        </p>
      )}
    </section>
  );
}
