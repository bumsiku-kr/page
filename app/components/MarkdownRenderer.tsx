'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
} 