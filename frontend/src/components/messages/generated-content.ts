import type { ChatMessage } from '@/lib/api/messages';

// The API fills `content` with these Korean defaults when a photo has no
// caption or a place has no note (backend/src/messages/messages.service.ts,
// createImage and createPlace). They are server data, not text a user wrote,
// so the UI treats them as "no text" and shows localized copy instead.
const GENERATED_IMAGE_CONTENT = '사진을 공유했습니다.';

function generatedPlaceContent(placeName: string): string {
  return `${placeName} 장소를 공유했습니다.`;
}

export function isGeneratedMessageContent(
  message: Pick<ChatMessage, 'type' | 'content' | 'place'>,
): boolean {
  if (message.type === 'IMAGE') {
    return message.content === GENERATED_IMAGE_CONTENT;
  }
  if (message.type === 'PLACE' && message.place !== null) {
    return message.content === generatedPlaceContent(message.place.name);
  }
  return false;
}
