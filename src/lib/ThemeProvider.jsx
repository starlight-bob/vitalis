import { useEffect } from 'react';

export default function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;
    const apply = (e) => {
      if (e.matches) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return children;
}