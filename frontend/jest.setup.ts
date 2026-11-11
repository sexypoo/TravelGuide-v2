import '@testing-library/jest-dom';

// Server components read the locale from request cookies; unit tests render
// them outside a request, in Korean (#80).
jest.mock('./src/i18n/server', () => {
  const { ko } = jest.requireActual<typeof import('./src/i18n/messages/ko')>(
    './src/i18n/messages/ko',
  );
  return {
    getLocale: jest.fn().mockResolvedValue('ko'),
    getMessages: jest.fn().mockResolvedValue(ko),
  };
});
