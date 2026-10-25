import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { TRAVEL_TEST_QUESTIONS } from '@/lib/travel-test/content';
import { TravelTest } from './travel-test';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const push = jest.fn();

beforeEach(() => {
  jest.mocked(useRouter).mockReturnValue({
    push,
  } as unknown as ReturnType<typeof useRouter>);
});

describe('TravelTest', () => {
  it('walks through ten questions and opens the scored result', () => {
    render(<TravelTest />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));

    for (const [index, question] of TRAVEL_TEST_QUESTIONS.entries()) {
      expect(
        screen.getByRole('heading', { name: question.text }),
      ).toBeInTheDocument();
      expect(screen.getByText(`${index + 1} / 10`)).toBeInTheDocument();
      const dawn = question.options.find((option) => option.type === 'dawn');
      const choice = dawn ?? question.options[0];
      if (choice === undefined) throw new Error('question without options');
      fireEvent.click(screen.getByRole('button', { name: choice.label }));
    }

    expect(push).toHaveBeenCalledWith('/test/dawn');
  });

  it('goes back to the previous question and keeps the earlier answer', () => {
    render(<TravelTest />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    const first = TRAVEL_TEST_QUESTIONS[0];
    const second = TRAVEL_TEST_QUESTIONS[1];
    if (first === undefined || second === undefined)
      throw new Error('no questions');
    const firstOption = first.options[2];
    if (firstOption === undefined) throw new Error('no option');

    fireEvent.click(screen.getByRole('button', { name: firstOption.label }));
    expect(
      screen.getByRole('heading', { name: second.text }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '이전 질문' }));
    expect(
      screen.getByRole('heading', { name: first.text }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: firstOption.label }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
