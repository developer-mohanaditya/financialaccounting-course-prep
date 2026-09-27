import type { MockExam } from '../../lib/types';
import { EXAM_01 } from './exam01';
import { EXAM_02 } from './exam02';
import { EXAM_03 } from './exam03';
import { EXAM_04 } from './exam04';
import { EXAM_05 } from './exam05';
import { EXAM_06 } from './exam06';
import { EXAM_07 } from './exam07';
import { EXAM_08 } from './exam08';
import { EXAM_09 } from './exam09';
import { EXAM_10 } from './exam10';

/** Single source of truth for the ten mock exams and their answer keys. */
export const MOCK_EXAMS: MockExam[] = [
  EXAM_01,
  EXAM_02,
  EXAM_03,
  EXAM_04,
  EXAM_05,
  EXAM_06,
  EXAM_07,
  EXAM_08,
  EXAM_09,
  EXAM_10,
].sort((a, b) => a.number - b.number);

export const EXAM_BY_ID: Record<string, MockExam> = Object.fromEntries(
  MOCK_EXAMS.map((exam) => [exam.id, exam]),
);

export const TOTAL_EXAMS = MOCK_EXAMS.length;
