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
  if (pathname.startsWith('/bracket')) return '/competition';
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
        backgroundColor: 'rgba(251, 249, 248, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(144,77,0,0.08)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.07)',
        paddingTop: '6px',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        display: 'flex',
        position: 'relative',
      }}
    >
      {/* Sliding pill indicator */}
      {activeIndex >= 0 && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: `${activeIndex * (100 / navItems.length)}%`,
            width: `${100 / navItems.length}%`,
            height: '50px',
            borderRadius: '14px',
            background: 'rgba(144,77,0,0.1)',
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
                    color={isActive ? 'var(--color-primary)' : '#b0a39d'}
                  />
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'Epilogue, sans-serif',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-primary)' : '#b0a39d',
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
