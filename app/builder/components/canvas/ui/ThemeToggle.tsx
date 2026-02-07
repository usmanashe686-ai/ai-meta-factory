'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = React.useState(true);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      className="p-2 bg-gray-800 rounded hover:bg-gray-700"
      onClick={() => setDark(!dark)}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
