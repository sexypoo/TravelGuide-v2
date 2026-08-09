import { render } from '@testing-library/react';
import { AppIcon, type AppIconName } from './app-icon';

const icons: readonly AppIconName[] = [
  'add',
  'alert',
  'arrow-left',
  'arrow-right',
  'check',
  'clock',
  'close',
  'crowd',
  'door',
  'external',
  'heart',
  'heart-filled',
  'image',
  'info',
  'live',
  'minus',
  'pin',
  'send',
  'shield',
  'sparkle',
  'topic',
  'refresh',
];

describe('AppIcon', () => {
  it('renders every supported icon as a hidden, consistently sized SVG', () => {
    const { container } = render(
      <>
        {icons.map((icon) => (
          <AppIcon key={icon} name={icon} />
        ))}
      </>,
    );

    expect(container.querySelectorAll('svg')).toHaveLength(icons.length);
    container.querySelectorAll('svg').forEach((icon) => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });
});
