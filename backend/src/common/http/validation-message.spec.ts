import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ProblemException } from './problem.exception';
import {
  firstValidationMessage,
  koreanConstraintMessage,
  uploadTooLargeDetail,
} from './validation-message';

class PlaceDto {
  @IsString()
  @MaxLength(5)
  placeName!: string;
}

class SampleDto {
  @IsOptional()
  @IsInt()
  @Max(1440)
  waitMinutes?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(4)
  nickname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  travelStyles?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceDto)
  place?: PlaceDto;
}

const pipe = new ValidationPipe({
  exceptionFactory: (errors): ProblemException =>
    new ProblemException(
      'VALIDATION_FAILED',
      firstValidationMessage(errors),
      HttpStatus.BAD_REQUEST,
    ),
  forbidNonWhitelisted: true,
  transform: true,
  whitelist: true,
});

async function detailFor(body: Record<string, unknown>): Promise<string> {
  try {
    await pipe.transform(body, { type: 'body', metatype: SampleDto });
  } catch (error) {
    if (error instanceof ProblemException) {
      return error.message;
    }
    throw error;
  }
  throw new Error('expected validation to fail');
}

describe('firstValidationMessage', () => {
  it('explains a number limit in Korean', async () => {
    await expect(detailFor({ waitMinutes: 2000 })).resolves.toBe(
      '예상 대기 시간은 1440 이하여야 해요.',
    );
    await expect(detailFor({ waitMinutes: 2.5 })).resolves.toBe(
      '예상 대기 시간은 정수로 입력해 주세요.',
    );
  });

  it('explains length limits with the right particle', async () => {
    await expect(detailFor({ nickname: '가' })).resolves.toBe(
      '닉네임은 2자 이상 입력해 주세요.',
    );
    await expect(detailFor({ nickname: '가나다라마' })).resolves.toBe(
      '닉네임은 4자 이하로 입력해 주세요.',
    );
  });

  it('covers email, arrays, nested fields, and unknown fields', async () => {
    await expect(detailFor({ email: 'nope' })).resolves.toBe(
      '올바른 이메일 주소를 입력해 주세요.',
    );
    await expect(
      detailFor({ travelStyles: ['a', 'b', 'c', 'd'] }),
    ).resolves.toBe('여행 스타일은 3개까지 고를 수 있어요.');
    await expect(
      detailFor({ place: { placeName: '아주아주긴이름' } }),
    ).resolves.toBe('장소 이름은 5자 이하로 입력해 주세요.');
    await expect(detailFor({ role: 'ADMIN' })).resolves.toBe(
      '보낼 수 없는 항목이 들어 있어요.',
    );
  });
});

describe('koreanConstraintMessage', () => {
  it('keeps messages a DTO already wrote in Korean', () => {
    expect(
      koreanConstraintMessage('name', 'isString', '이름을 입력해 주세요.'),
    ).toBe('이름을 입력해 주세요.');
  });

  it('falls back to a generic label for unknown fields', () => {
    expect(
      koreanConstraintMessage(
        'mystery',
        'isString',
        'mystery must be a string',
      ),
    ).toBe('입력값을 확인해 주세요.');
    expect(
      koreanConstraintMessage(
        'title',
        'isNotEmpty',
        'title should not be empty',
      ),
    ).toBe('제목을 입력해 주세요.');
  });
});

describe('uploadTooLargeDetail', () => {
  it('names the limit of the route that rejected the file', () => {
    expect(uploadTooLargeDetail('/api/v1/verifications/traveler')).toBe(
      '증빙 파일은 5MB 이하여야 합니다.',
    );
    expect(uploadTooLargeDetail('/api/v1/users/me/avatar')).toBe(
      '프로필 사진은 5MB 이하여야 합니다.',
    );
    expect(uploadTooLargeDetail('/api/v1/rooms/jeju/messages/images')).toBe(
      '이미지는 10MB 이하여야 합니다.',
    );
  });
});
