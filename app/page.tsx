import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 히어로 섹션 */}
      <section className="py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* 프로필 이미지 */}
          <div className="w-40 h-40 md:w-48 md:h-48 relative overflow-hidden rounded-full border-4 border-gray-200">
            <Image
              src="/profile.jpg"
              alt="프로필 이미지"
              fill
              sizes="(max-width: 768px) 160px, 192px"
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          {/* 자기소개 */}
          <div className="flex flex-col space-y-6 text-center md:text-left">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">안녕하세요, 프론트엔드 개발자입니다.</h1>
              <p className="text-xl text-gray-600">
                React와 TypeScript를 중심으로 사용자 친화적인 UI를 만듭니다.
              </p>
            </div>
            
            {/* CTA 버튼 */}
            <div className="flex justify-center md:justify-start">
              <Link 
                href="/blog" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full text-center transition-colors"
              >
                블로그 읽기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기술 스택 */}
      <section className="py-12 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-8 text-center">주요 기술 스택</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {technologies.map((tech) => (
            <div key={tech.name} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 flex items-center justify-center mb-3">
                <Image 
                  src={tech.icon} 
                  alt={tech.name} 
                  width={48} 
                  height={48}
                  unoptimized
                />
              </div>
              <span className="font-medium">{tech.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// 임시 기술 스택 데이터
const technologies = [
  { name: 'React', icon: '/icons/react.svg' },
  { name: 'TypeScript', icon: '/icons/typescript.svg' },
  { name: 'Next.js', icon: '/icons/nextjs.svg' },
  { name: 'Tailwind CSS', icon: '/icons/tailwind.svg' },
];
