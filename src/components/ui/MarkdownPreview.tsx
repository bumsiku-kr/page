'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

/**
 * Safe Markdown Preview Component
 * Uses react-markdown with rehype-sanitize to prevent XSS attacks
 */
export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // Custom sanitize schema - extends default with safe attributes
  const sanitizeSchema = useMemo(
    () => ({
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        a: [...(defaultSchema.attributes?.a || []), 'className', 'target', 'rel'],
        code: [...(defaultSchema.attributes?.code || []), 'className'],
        pre: [...(defaultSchema.attributes?.pre || []), 'className'],
        img: [...(defaultSchema.attributes?.img || []), 'className', 'alt', 'title', 'loading'],
        span: [...(defaultSchema.attributes?.span || []), 'className'],
        div: [...(defaultSchema.attributes?.div || []), 'className'],
      },
      // Block dangerous protocols
      protocols: {
        ...defaultSchema.protocols,
        href: ['http', 'https', 'mailto'],
        src: ['http', 'https', 'data'],
      },
    }),
    []
  );

  if (!content.trim()) {
    return (
      <div className={`prose prose-lg max-w-none ${className}`}>
        <p className="text-gray-400">내용을 입력하세요...</p>
      </div>
    );
  }

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          a: ({ href, children, ...props }) => {
            // Validate href - block javascript: protocol
            const safeHref =
              href && /^(https?:|mailto:|\/|#)/.test(href) ? href : '#';
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt, ...props }) => {
            // Validate src - only allow safe protocols (src can be string or Blob)
            const srcString = typeof src === 'string' ? src : '';
            const safeSrc = /^(https?:|data:image\/|\/[^:])/.test(srcString) ? srcString : '';
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={safeSrc}
                alt={alt || ''}
                loading="lazy"
                className="max-w-full h-auto rounded-lg my-4"
                {...props}
              />
            );
          },
          code: ({ className, children, ...props }) => {
            const isInline = !className?.includes('language-');
            return (
              <code
                className={
                  isInline
                    ? 'bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono'
                    : className
                }
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre
              className="bg-gray-100 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4"
              {...props}
            >
              {children}
            </pre>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-6" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold mt-8 mb-4" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold mt-6 mb-3" {...props}>
              {children}
            </h3>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
              {...props}
            >
              {children}
            </blockquote>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc ml-6 my-3" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal ml-6 my-3" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="mb-1" {...props}>
              {children}
            </li>
          ),
          hr: () => <hr className="border-t border-gray-300 my-6" />,
          p: ({ children, ...props }) => (
            <p className="mb-4" {...props}>
              {children}
            </p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
