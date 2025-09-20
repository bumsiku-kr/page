'use client';

import { useMemo } from 'react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const renderedContent = useMemo(() => {
    if (!content.trim()) {
      return '<p class="text-gray-400">내용을 입력하세요...</p>';
    }

    let html = content;

    // 코드 블록 처리 (```로 감싸진 부분)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-100 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm">${code.trim()}</code></pre>`;
    });

    // 인라인 코드 처리
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // 제목 처리
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>');

    // 굵은 글씨
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // 기울임
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // 링크
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // 이미지
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
    );

    // 순서 없는 리스트
    html = html.replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="my-3">$1</ul>');

    // 순서 있는 리스트
    html = html.replace(/^\d+\. (.*$)/gm, (match, text, offset, string) => {
      const lines = string.substring(0, offset).split('\n');
      const currentLineIndex = lines.length - 1;
      const number = lines.filter(
        (line, index) => index <= currentLineIndex && /^\d+\./.test(line)
      ).length;
      return `<li class="ml-4 mb-1">${number}. ${text}</li>`;
    });

    // 인용구
    html = html.replace(
      /^> (.*$)/gm,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>'
    );

    // 구분선
    html = html.replace(/^---$/gm, '<hr class="border-t border-gray-300 my-6" />');

    // 줄바꿈
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = html.replace(/\n/g, '<br>');

    // 문단 감싸기
    if (!html.startsWith('<')) {
      html = '<p class="mb-4">' + html + '</p>';
    }

    return html;
  }, [content]);

  return (
    <div
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
