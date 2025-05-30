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
  
  // 추가 스타일 조정 - 균형 잡힌 텍스트 사이즈로 통일
  const customStyles = `
    prose-headings:my-4
    prose-h1:text-2xl prose-h1:font-bold 
    prose-h2:text-xl prose-h2:font-semibold 
    prose-h3:text-lg prose-h3:font-semibold
    prose-h4:text-base prose-h4:font-medium
    prose-p:text-base prose-p:my-2
    prose-ul:my-2 prose-ol:my-2
    prose-li:my-1 prose-li:text-base
    prose-pre:text-sm prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:border-0 prose-pre:shadow-none prose-pre:rounded-none
    prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
    prose-img:my-4
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
                  padding: '1rem',
                  overflow: 'auto',
                  maxWidth: '100%',
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
