import { Category } from '../../types';

/**
 * 카테고리 ID로 카테고리 이름을 찾는 함수
 * @param categoryId 카테고리 ID
 * @param categories 카테고리 목록
 * @returns 카테고리 이름
 */
export const getCategoryName = (categoryId: number | undefined, categories: Category[]): string => {
  if (!categoryId) {
    return '카테고리 없음';
  }
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) {
    console.error(`카테고리를 찾을 수 없습니다. ID: ${categoryId}`);
    return '삭제된 카테고리';
  }
  return category.name;
}; 