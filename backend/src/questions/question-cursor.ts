export interface QuestionCursor {
  createdAt: Date;
  id: string;
}

interface CursorPayload {
  createdAt: string;
  id: string;
}

export function encodeQuestionCursor(cursor: QuestionCursor): string {
  const payload: CursorPayload = {
    createdAt: cursor.createdAt.toISOString(),
    id: cursor.id,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeQuestionCursor(value: string): QuestionCursor | null {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    );
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('createdAt' in parsed) ||
      !('id' in parsed) ||
      typeof parsed.createdAt !== 'string' ||
      typeof parsed.id !== 'string' ||
      parsed.id.length === 0
    ) {
      return null;
    }
    const createdAt = new Date(parsed.createdAt);
    if (
      Number.isNaN(createdAt.getTime()) ||
      createdAt.toISOString() !== parsed.createdAt
    ) {
      return null;
    }
    return { createdAt, id: parsed.id };
  } catch {
    return null;
  }
}
