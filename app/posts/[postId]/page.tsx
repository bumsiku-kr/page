'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 임시 블로그 데이터
const blogPosts = [
  {
    id: '1',
    title: 'React에서 상태 관리하기',
    content: `
## React에서 상태 관리하기

React에서 상태 관리는 애플리케이션의 복잡성이 증가함에 따라 점점 더 중요한 주제가 되고 있습니다. 이 글에서는 React에서 사용할 수 있는 다양한 상태 관리 방법에 대해 살펴보겠습니다.

### 1. useState

가장 기본적인 상태 관리 방법은 React의 내장 훅인 \`useState\`를 사용하는 것입니다.

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\`

\`useState\`는 간단한 상태를 관리하는 데 적합하지만, 컴포넌트 간에 상태를 공유해야 하는 경우에는 추가적인 방법이 필요합니다.

### 2. Context API

React의 Context API는 컴포넌트 트리를 통해 데이터를 "주입"할 수 있는 방법을 제공합니다.

\`\`\`jsx
// ThemeContext.js
const ThemeContext = React.createContext('light');

// App.js
function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <MainComponent />
    </ThemeContext.Provider>
  );
}

// Button.js
function Button() {
  const { theme } = useContext(ThemeContext);
  
  return <button className={theme}>Click me</button>;
}
\`\`\`

Context API는 전역 상태를 관리하는 데 유용하지만, 너무 많은 컨텍스트가 중첩되면 "컨텍스트 지옥"이 발생할 수 있습니다.

### 3. Redux

Redux는 예측 가능한 상태 관리를 위한 라이브러리입니다. 액션을 통해 상태 변경을 일으키고, 리듀서를 통해 상태 업데이트 로직을 정의합니다.

\`\`\`jsx
// actions.js
export const increment = () => ({
  type: 'INCREMENT'
});

// reducers.js
const counterReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
};

// Counter.js
function Counter({ count, increment }) {
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

const mapStateToProps = (state) => ({
  count: state.count
});

const mapDispatchToProps = { increment };

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
\`\`\`

Redux는 복잡한 상태 관리에 적합하지만, 보일러플레이트 코드가 많이 필요합니다.

### 4. Recoil

Recoil은 Facebook에서 개발한 상태 관리 라이브러리로, React와의 통합이 원활합니다.

\`\`\`jsx
// atoms.js
export const countState = atom({
  key: 'countState',
  default: 0
});

// Counter.js
function Counter() {
  const [count, setCount] = useRecoilState(countState);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\`

Recoil은 React의 동시성 모드와 호환되며, 더 적은 보일러플레이트로 상태를 관리할 수 있습니다.

### 결론

어떤 상태 관리 방법을 선택할지는 애플리케이션의 복잡성과 요구사항에 따라 달라집니다. 작은 애플리케이션에서는 \`useState\`와 Context API로 충분할 수 있지만, 더 복잡한 애플리케이션에서는 Redux나 Recoil 같은 라이브러리를 고려할 수 있습니다.
    `,
    date: '2023-04-01',
    tags: ['React', '상태관리', 'Redux', 'Context API'],
    category: '프론트엔드',
    nextPost: { id: '2', title: 'Next.js 13의 새로운 기능' },
    prevPost: null,
  },
  {
    id: '2',
    title: 'Next.js 13의 새로운 기능',
    content: `
## Next.js 13의 새로운 기능

Next.js 13은 React 애플리케이션을 더 쉽게 구축할 수 있는 많은 새로운 기능을 도입했습니다. 이 글에서는 Next.js 13의 주요 기능을 살펴보겠습니다.

### 1. 앱 라우터 (App Router)

Next.js 13의 가장 큰 변화 중 하나는 새로운 앱 라우터의 도입입니다. \`pages\` 디렉토리 대신 \`app\` 디렉토리를 사용하여 라우팅을 구성할 수 있습니다.

\`\`\`jsx
// app/page.js
export default function HomePage() {
  return <h1>Home Page</h1>;
}

// app/blog/page.js
export default function BlogPage() {
  return <h1>Blog Page</h1>;
}
\`\`\`

앱 라우터는 중첩 라우팅, 레이아웃, 로딩 상태, 오류 처리 등을 더 쉽게 관리할 수 있게 해줍니다.

### 2. 서버 컴포넌트 (Server Components)

Next.js 13은 React 서버 컴포넌트를 지원합니다. 서버 컴포넌트는 서버에서 렌더링되고, 클라이언트로 HTML만 전송되므로 번들 크기를 줄이고 성능을 향상시킬 수 있습니다.

\`\`\`jsx
// app/ServerComponent.js
export default async function ServerComponent() {
  const data = await fetch('https://api.example.com/data').then(res => res.json());
  
  return (
    <div>
      <h1>Server Component</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
\`\`\`

서버 컴포넌트는 기본적으로 \`async\`/\`await\`를 지원하므로, 데이터 페칭이 더 간단해집니다.

### 3. 데이터 페칭

Next.js 13은 컴포넌트 레벨에서 데이터 페칭을 지원합니다.

\`\`\`jsx
// app/blog/[slug]/page.js
async function getPost(slug) {
  const res = await fetch(\`https://api.example.com/posts/\${slug}\`);
  return res.json();
}

export default async function Post({ params }) {
  const post = await getPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
\`\`\`

이 방식은 각 페이지 또는 컴포넌트가 필요한 데이터만 가져올 수 있게 해줍니다.

### 4. 스트리밍 (Streaming)

Next.js 13은 UI 스트리밍을 지원합니다. 이를 통해 페이지의 일부가 준비되면 즉시 사용자에게 보여주고, 나머지 부분은 준비되는 대로 스트리밍할 수 있습니다.

\`\`\`jsx
// app/page.js
import { Suspense } from 'react';
import Loading from './loading';
import SlowComponent from './SlowComponent';

export default function Page() {
  return (
    <div>
      <h1>Welcome to my page</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
\`\`\`

이 기능은 사용자 경험을 향상시키고, 웹 핵심 성능 지표인 Time to First Byte (TTFB)와 First Contentful Paint (FCP)를 개선하는 데 도움이 됩니다.

### 결론

Next.js 13은 앱 라우터, 서버 컴포넌트, 개선된 데이터 페칭, UI 스트리밍 등을 통해 개발자 경험과 애플리케이션 성능을 크게 향상시켰습니다. 이러한 기능들은 더 빠르고, 더 쉽게 구축할 수 있는 웹 애플리케이션을 만들 수 있게 해줍니다.
    `,
    date: '2023-03-15',
    tags: ['Next.js', 'React', '서버 컴포넌트'],
    category: '프론트엔드',
    nextPost: { id: '3', title: 'TypeScript 타입 시스템 깊게 이해하기' },
    prevPost: { id: '1', title: 'React에서 상태 관리하기' },
  },
  {
    id: '3',
    title: 'TypeScript 타입 시스템 깊게 이해하기',
    content: `
## TypeScript 타입 시스템 깊게 이해하기

TypeScript는 JavaScript에 정적 타입 검사를 추가하여 코드의 안정성과 가독성을 향상시킵니다. 이 글에서는 TypeScript의 고급 타입 기능에 대해 자세히 살펴보겠습니다.

### 내용 준비 중입니다...
    `,
    date: '2023-02-28',
    tags: ['TypeScript', '타입 시스템'],
    category: '개발 언어',
    nextPost: { id: '4', title: 'CSS Grid와 Flexbox 완벽 가이드' },
    prevPost: { id: '2', title: 'Next.js 13의 새로운 기능' },
  },
  {
    id: '4',
    title: 'CSS Grid와 Flexbox 완벽 가이드',
    content: `
## CSS Grid와 Flexbox 완벽 가이드

모던 웹 레이아웃을 구성하는 데 있어 CSS Grid와 Flexbox는 필수적인 도구입니다. 이 글에서는 두 기술의 차이점과 적절한 사용 상황에 대해 알아보겠습니다.

### 내용 준비 중입니다...
    `,
    date: '2023-02-10',
    tags: ['CSS', 'Grid', 'Flexbox'],
    category: 'CSS',
    nextPost: null,
    prevPost: { id: '3', title: 'TypeScript 타입 시스템 깊게 이해하기' },
  },
];

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  
  // 해당 ID의 게시글 찾기
  const post = blogPosts.find((p) => p.id === postId);
  
  // 게시글이 없을 경우
  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-8">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <Link 
            href="/blog" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors"
          >
            블로그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <article className="max-w-2xl mx-auto">
        {/* 게시글 상단 정보 */}
        <header className="mb-10">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <span>{post.date}</span>
            <span>•</span>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* 게시글 내용 */}
        <div className="prose prose-lg max-w-none mb-12">
          {/* Markdown 형식의 내용을 정적으로 표시 (실제로는 markdown 라이브러리 사용 필요) */}
          <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }} />
        </div>

        {/* 이전/다음 게시글 */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {post.prevPost && (
              <Link 
                href={`/posts/${post.prevPost.id}`}
                className="flex-1 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-500 block mb-1">이전 게시글</span>
                <span className="font-medium">{post.prevPost.title}</span>
              </Link>
            )}
            
            {post.nextPost && (
              <Link 
                href={`/posts/${post.nextPost.id}`}
                className="flex-1 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-right"
              >
                <span className="text-sm text-gray-500 block mb-1">다음 게시글</span>
                <span className="font-medium">{post.nextPost.title}</span>
              </Link>
            )}
          </div>
        </div>
      </article>
    </div>
  );
} 