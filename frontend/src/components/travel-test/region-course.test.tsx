import { fireEvent, render, screen } from '@testing-library/react';
import { COURSE_REGIONS } from '@/lib/travel-test/courses';
import { RegionCourse } from './region-course';

describe('RegionCourse', () => {
  it('starts in Jeju and switches the course by region', () => {
    render(<RegionCourse type="food" />);

    expect(
      screen.getByRole('heading', {
        name: '골목 미식가에게 추천하는 제주의 하루',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제주' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: '부산' }));

    expect(
      screen.getByRole('heading', {
        name: '골목 미식가에게 추천하는 부산의 하루',
      }),
    ).toBeInTheDocument();
    const busan = COURSE_REGIONS.find((region) => region.key === 'busan');
    const firstStop = busan?.courses.food[0];
    if (firstStop === undefined) throw new Error('missing Busan course');
    expect(screen.getByText(firstStop.place)).toBeInTheDocument();
    expect(
      screen.getByText(
        '여쭈어가 고른 예시 코스예요. 아직 현지인이 확인하지 않았어요.',
      ),
    ).toBeInTheDocument();
  });
});
