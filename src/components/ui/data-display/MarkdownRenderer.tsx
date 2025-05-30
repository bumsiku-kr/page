'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // 기본 마크다운 스타일 클래스 - 나눔고딕 폰트 적용
  const defaultClassName = 'prose max-w-none bg-white font-nanum-gothic';
  
  // 한글 가독성 최적화 스타일 - 줄 간격, 문단 간격, 글자 간격 개선
  const customStyles = `
    prose-headings:my-6 prose-headings:leading-relaxed prose-headings:tracking-tight prose-headings:text-gray-900
    prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-8 prose-h1:mt-8 prose-h1:leading-tight prose-h1:tracking-tight
    prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-6 prose-h2:mt-8 prose-h2:leading-relaxed prose-h2:tracking-tight
    prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-4 prose-h3:mt-6 prose-h3:leading-relaxed prose-h3:tracking-tight
    prose-h4:text-base prose-h4:font-medium prose-h4:mb-3 prose-h4:mt-5 prose-h4:leading-relaxed prose-h4:tracking-tight
    prose-p:text-base prose-p:my-4 prose-p:leading-7 prose-p:tracking-wide prose-p:text-gray-800
    prose-ul:my-4 prose-ul:leading-7 prose-ol:my-4 prose-ol:leading-7
    prose-li:my-2 prose-li:text-base prose-li:leading-7 prose-li:tracking-wide prose-li:text-gray-800 prose-li:pl-1
    prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:leading-7
    prose-strong:text-gray-900 prose-strong:font-semibold
    prose-em:text-gray-700
    prose-a:text-blue-600 prose-a:underline prose-a:decoration-2 prose-a:underline-offset-2 hover:prose-a:text-blue-800
    prose-pre:text-sm prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:border-0 prose-pre:shadow-none prose-pre:rounded-none prose-pre:my-4
    prose-code:text-sm prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:text-gray-800 prose-code:font-medium
    prose-img:my-6 prose-img:rounded-lg prose-img:shadow-sm prose-img:max-w-full prose-img:max-h-80 prose-img:object-contain prose-img:block
    prose-table:my-6 prose-table:border-collapse
    prose-th:bg-gray-50 prose-th:py-3 prose-th:px-4 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 prose-th:border prose-th:border-gray-300
    prose-td:py-3 prose-td:px-4 prose-td:border prose-td:border-gray-300 prose-td:text-gray-800
    prose-hr:my-8 prose-hr:border-gray-300
  `;
  
  return (
    <div className={`${defaultClassName} ${customStyles} ${className}`.trim()}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneLight}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  backgroundColor: '#fafafa',
                  padding: '1.5rem',
                  overflow: 'auto',
                  maxWidth: '100%',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  lineHeight: '1.6',
                  fontSize: '14px',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={inline ? 'inline-code' : className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
