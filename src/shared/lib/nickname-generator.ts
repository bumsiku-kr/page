/**
 * 랜덤 닉네임 생성 유틸리티
 * 토스 블로그 스타일: 형용사 + 동물명 조합
 */

const ADJECTIVES = [
  '재미있는',
  '신나는',
  '명랑한',
  '씩씩한',
  '귀여운',
  '용감한',
  '똑똑한',
  '활발한',
  '사랑스러운',
  '멋진',
  '상냥한',
  '즐거운',
  '행복한',
  '밝은',
  '다정한',
  '착한',
  '열정적인',
  '친절한',
  '따뜻한',
  '유쾌한',
];

const ANIMALS = [
  '돌고래',
  '코알라',
  '너구리',
  '사자',
  '앵무새',
  '펭귄',
  '토끼',
  '판다',
  '호랑이',
  '여우',
  '고양이',
  '강아지',
  '햄스터',
  '다람쥐',
  '고래',
  '거북이',
  '부엉이',
  '독수리',
  '비둘기',
  '기린',
];

/**
 * 랜덤 닉네임 생성
 * @returns 형용사 + 동물명 조합 (예: "재미있는돌고래")
 */
export const generateRandomNickname = (): string => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adjective}${animal}`;
};

/**
 * 랜덤 프로필 아이콘 번호 생성 (1-24)
 * 토스 블로그 스타일 이모지 기반 아바타
 */
export const generateRandomAvatarId = (): number => {
  return Math.floor(Math.random() * 24) + 1;
};

/**
 * 동물명-이모지 매핑
 * 닉네임에 포함된 동물명에 따라 적절한 이모지 반환
 */
const ANIMAL_EMOJI_MAP: Record<string, string> = {
  돌고래: '🐬',
  코알라: '🐨',
  너구리: '🦝',
  사자: '🦁',
  앵무새: '🦜',
  펭귄: '🐧',
  토끼: '🐰',
  판다: '🐼',
  호랑이: '🐯',
  여우: '🦊',
  고양이: '🐱',
  강아지: '🐶',
  햄스터: '🐹',
  다람쥐: '🐿️',
  고래: '🐋',
  거북이: '🐢',
  부엉이: '🦉',
  독수리: '🦅',
  비둘기: '🕊️',
  기린: '🦒',
};

/**
 * 닉네임에서 동물명을 찾아 해당하는 이모지 반환
 * @param nickname - 확인할 닉네임 문자열
 * @returns 매칭되는 동물 이모지 또는 기본 이모지
 */
export const getAnimalEmoji = (nickname: string): string => {
  // 닉네임에 포함된 동물명 찾기
  for (const [animal, emoji] of Object.entries(ANIMAL_EMOJI_MAP)) {
    if (nickname.includes(animal)) {
      return emoji;
    }
  }

  // 매칭되는 동물이 없을 경우 기본 이모지 반환
  return '😊';
};
