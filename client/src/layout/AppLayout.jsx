import { BarChart3, Boxes, LayoutDashboard, Moon, ReceiptText, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/sales', label: 'Sales', icon: ReceiptText },
  { to: '/reports', label: 'Reports', icon: BarChart3 }
];

export default function AppLayout({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('inventory-theme') || 'light');
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('inventory-theme', theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <span>ET</span>
            <div>
              <strong>Ethio Stock</strong>
              <small>Inventory Management</small>
            </div>
          </div>
          <nav>
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
