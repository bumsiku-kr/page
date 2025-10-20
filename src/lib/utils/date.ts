/**
 * 날짜 포맷팅 유틸리티 (SSR 안전)
 */

export const dateUtils = {
  /**
   * YYYY.MM.DD 포맷 (간단한 표시용)
   * @example dateUtils.formatShort("2024-01-15") => "2024.01.15"
   */
  formatShort(dateString: string): string {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}.${month}.${day}`;
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 정보 없음';
    }
  },

  /**
   * YYYY년 M월 D일 포맷 (한국어 표시)
   * @example dateUtils.formatKorean("2024-01-15") => "2024년 1월 15일"
   */
  formatKorean(dateString: string): string {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const monthNames = [
        '',
        '1월',
        '2월',
        '3월',
        '4월',
        '5월',
        '6월',
        '7월',
        '8월',
        '9월',
        '10월',
        '11월',
        '12월',
      ];

      return `${year}년 ${monthNames[month]} ${day}일`;
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 정보 없음';
    }
  },

  /**
   * 상대 시간 표시 (방금 전, 3시간 전 등)
   * @example dateUtils.formatRelative("2024-01-15T10:00:00") => "2시간 전"
   */
  formatRelative(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}시간 전`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}일 전`;

      return this.formatKorean(dateString);
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 정보 없음';
    }
  },
};
