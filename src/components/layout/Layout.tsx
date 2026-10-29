import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import InstallPrompt from '../ui/InstallPrompt';

/** Прокрутка наверх при смене страницы */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function Layout() {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        onClick={(e) => {
          // Без этого браузер просто проскроллит страницу, а фокус останется
          // в адресной строке — клавиатурному пользователю придётся табулировать
          // всё меню заново.
          e.preventDefault();
          mainRef.current?.focus();
          mainRef.current?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-accent-red focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Перейти к содержимому
      </a>
      <ScrollToTop />
      <Header />
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 pt-16 outline-none lg:pt-20"
      >
        <Outlet />
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  );
}
