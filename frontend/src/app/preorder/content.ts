import type { AppIconName } from '@/components/common';
import type { Messages } from '@/i18n/messages';

type PreorderCopy = Messages['legal']['preorder'];

/** Icons for `legal.preorder.problems`, in the same order. */
const problemIcons: ReadonlyArray<AppIconName> = ['live', 'clock', 'shield'];

/** Icons for `legal.preorder.trustPoints`, in the same order. */
const trustIcons: ReadonlyArray<AppIconName> = [
  'shield',
  'live',
  'check',
  'topic',
];

export function preorderProblems(copy: PreorderCopy): ReadonlyArray<{
  icon: AppIconName;
  title: string;
  description: string;
}> {
  return copy.problems.map((problem, index) => ({
    icon: problemIcons[index] ?? 'live',
    title: problem.title,
    description: problem.description,
  }));
}

export function preorderTrustPoints(
  copy: PreorderCopy,
): ReadonlyArray<{ icon: AppIconName; text: string }> {
  return copy.trustPoints.map((text, index) => ({
    icon: trustIcons[index] ?? 'check',
    text,
  }));
}
