// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', dark);
    localStorage.setItem('darkMode', dark);
  }, [dark]);

  return [dark, setDark];
}
