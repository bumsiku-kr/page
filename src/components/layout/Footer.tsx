'use client';

import Container from '../ui/Container';
import Divider from '../ui/Divider';

export default function Footer() {
  // const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-6 mt-8">
      <Container size="md">
        <Divider variant="border" className="my-0" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div></div>
          <div className="flex flex-col md:flex-row md:space-x-4 text-sm">
            <a href="mailto:peter012677@naver.com" className="text-gray-600 hover:text-gray-900">
              E-mail
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
