'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 py-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">© {currentYear} 기술 블로그. 모든 권리 보유.</p>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4 text-sm">
            <a href="/about" className="text-gray-600 hover:text-gray-900 mb-2 md:mb-0">
              소개
            </a>
            <a href="/privacy" className="text-gray-600 hover:text-gray-900 mb-2 md:mb-0">
              개인정보처리방침
            </a>
            <a href="/contact" className="text-gray-600 hover:text-gray-900">
              연락처
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
