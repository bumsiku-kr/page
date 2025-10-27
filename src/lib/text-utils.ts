// dateUtils는 @/lib/utils/date에서 직접 import 하세요

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가
 * @param text 원본 텍스트
 * @param maxLength 최대 길이
 * @returns 잘린 텍스트
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 객체의 빈 필드 제거
 * @param obj 원본 객체
 * @returns 빈 필드가 제거된 객체
 */
export function removeEmptyFields<T>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  Object.entries(obj as Record<string, any>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[key as keyof T] = value;
    }
  });

  return result;
}
