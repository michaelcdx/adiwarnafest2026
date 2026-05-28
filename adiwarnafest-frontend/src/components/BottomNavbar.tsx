import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { House, Trophy, MapTrifold, Sparkle } from '@phosphor-icons/react';

const navItems = [
  { id: 'home', label: 'Home', icon: House, path: '/' },
  { id: 'competition', label: 'Competition', icon: Trophy, path: '/competition' },
  { id: 'lucky-draw', label: 'Lucky Draw', icon: Sparkle, path: '/lucky-draw' },
  { id: 'map', label: 'Map', icon: MapTrifold, path: '/map' },
];

const getActivePath = (pathname: string) => {
  if (pathname.startsWith('/vendormap')) return '/map';
  return pathname;
};

const BottomNavbar: React.FC = () => {
  const location = useLocation();
  const activePath = getActivePath(location.pathname);
  const activeIndex = navItems.findIndex(item =>
    item.path === '/' ? activePath === '/' : activePath === item.path
  );

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-5"
      style={{
        background: 'rgba(255, 255, 255, 0.68)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        paddingTop: '6px',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        display: 'flex',
        position: 'relative',
      }}
    >
      {/* Sliding pill indicator — glass-btn-indigo style */}
      {activeIndex >= 0 && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: `${activeIndex * (100 / navItems.length)}%`,
            width: `${100 / navItems.length}%`,
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(-75deg, rgba(161,64,0,0.18), rgba(254,178,70,0.55), rgba(161,64,0,0.18))',
            border: '1px solid rgba(161,64,0,0.4)',
            boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.6), inset 0 -2px 2px rgba(161,64,0,0.2), 0 4px 12px rgba(161,64,0,0.22)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
          }}
        />
      )}

      {navItems.map(item => (
        <NavLink
          key={item.id}
          to={item.path}
          className="no-underline"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px 10px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {() => {
            const isActive = item.path === '/'
              ? activePath === '/'
              : activePath === item.path;
            const Icon = item.icon;
            return (
              <>
                <div
                  style={{
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Icon
                    size={23}
                    weight={isActive ? 'fill' : 'regular'}
                    color={isActive ? '#3a1800' : 'var(--text-muted)'}
                  />
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'Epilogue, sans-serif',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#3a1800' : 'var(--text-muted)',
                    marginTop: '2px',
                    transition: 'color 0.3s ease, font-weight 0.2s ease',
                    letterSpacing: isActive ? '0.2px' : '0',
                  }}
                >
                  {item.label}
                </span>
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavbar;
