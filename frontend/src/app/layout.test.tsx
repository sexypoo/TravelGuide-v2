import { isValidElement } from 'react';
import RootLayout, { viewport } from './layout';

describe('RootLayout', () => {
  it('asks mobile browsers to resize content above the software keyboard', () => {
    expect(viewport.interactiveWidget).toBe('resizes-content');
  });

  it('ignores attributes injected onto the body before hydration', () => {
    const layout = RootLayout({ children: <main>content</main> });
    const body = layout.props.children;

    expect(layout.props['data-scroll-behavior']).toBe('smooth');
    expect(isValidElement<{ suppressHydrationWarning?: boolean }>(body)).toBe(
      true,
    );

    if (!isValidElement<{ suppressHydrationWarning?: boolean }>(body)) {
      throw new Error('RootLayout must render a body element');
    }

    expect(body.type).toBe('body');
    expect(body.props.suppressHydrationWarning).toBe(true);
  });
});
