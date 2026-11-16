import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ style, className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.25rem',
        padding: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        color: 'var(--text-muted)',
        borderRadius: 'var(--radius-sm, 6px)',
        transition: 'transform var(--transition-fast), color var(--transition-fast)',
        ...style
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
