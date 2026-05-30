import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { House, Trophy, MapTrifold, UsersThree, X, User, Wrench, Sparkle, List } from '@phosphor-icons/react';
import adiwarnaLogo from '../image/Adiwarna_Logo_NoBackground.png';
import { useAuth } from '../store/auth';

const TopNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, role, email, username, signOut } = useAuth();

  const navItems = useMemo(() => {
    const items = [
      { label: 'Home', path: '/', icon: House },
      { label: 'Competition', path: '/competition', icon: Trophy },
      { label: 'Lucky Draw', path: '/lucky-draw', icon: Sparkle },
      { label: 'Map', path: '/map', icon: MapTrifold },
      { label: 'Committee', path: '/committee', icon: UsersThree },
      { label: 'Visitor Pass', path: '/visitor-pass', icon: User },
    ];
    if (isAuthenticated && (role === 'Admin' || role === 'Maintainer')) {
      items.push({ label: 'Maintenance', path: '/maintenance', icon: Wrench });
    }
    return items;
  }, [isAuthenticated, role]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header
        className="sticky top-0 z-5 w-full"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.62)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.75)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05), inset 0 -1px 0 rgba(255,255,255,0.8)',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* DESKTOP */}
        <div
          className="hidden md:flex w-full align-items-center justify-content-between px-6"
          style={{ maxWidth: '1100px', margin: '0 auto' }}
        >
          <NavLink to="/" className="flex align-items-center gap-2 no-underline">
            <img src={adiwarnaLogo} alt="Adiwarna" style={{ height: '38px', width: 'auto' }} />
            <span
              style={{
                fontFamily: 'Epilogue, sans-serif',
                fontWeight: 900,
                fontSize: '17px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Adiwarna Fest 2026
            </span>
          </NavLink>

          <nav className="flex align-items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className="no-underline"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '999px',
                  background: isActive
                    ? 'linear-gradient(-75deg, rgba(161,64,0,0.18), rgba(254,178,70,0.55), rgba(161,64,0,0.18))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(161,64,0,0.4)' : '1px solid transparent',
                  boxShadow: isActive ? 'inset 0 2px 2px rgba(255,255,255,0.6), 0 4px 12px rgba(161,64,0,0.2)' : 'none',
                  backdropFilter: isActive ? 'blur(8px)' : 'none',
                  WebkitBackdropFilter: isActive ? 'blur(8px)' : 'none',
                  color: isActive ? '#3a1800' : '#6b7280',
                  fontFamily: 'Epilogue, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  transition: 'all 0.18s ease',
                })}
              >
                <item.icon size={18} weight="fill" />
                {item.label}
              </NavLink>
            ))}
            
            {/* Auth Button Desktop */}
            <div style={{ position: 'relative' }}>
              <div className="button-wrap" style={{ marginLeft: '12px', fontSize: '14px' }}>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setIsProfileOpen(prev => !prev);
                    } else {
                      navigate('/login');
                    }
                  }}
                  className="premium-btn"
                  style={{ fontFamily: 'Epilogue, sans-serif' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={18} weight="bold" />
                    {isAuthenticated ? 'Profile' : 'Login'}
                  </span>
                </button>
                <div className="button-shadow" />
              </div>

              {/* Desktop Profile Dropdown Popover */}
              {isAuthenticated && isProfileOpen && (
                <>
                  <div
                    onClick={() => setIsProfileOpen(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 999,
                      background: 'transparent',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '240px',
                      background: 'rgba(255,255,255,0.72)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      borderRadius: '18px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      zIndex: 1000,
                      animation: 'menuFadeUp 0.2s ease forwards',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#8c7166', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hello,</span>
                      <span style={{ fontSize: '13px', color: '#1b1c1c', fontWeight: 800, wordBreak: 'break-all' }}>{email || username}</span>
                    </div>
                    
                    <div style={{ height: '1px', backgroundColor: 'rgba(209,223,246,0.08)' }} />
                    
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut().then(() => navigate('/'));
                      }}
                      className="glass-btn-indigo w-full"
                      style={{ padding: '10px', fontFamily: 'Epilogue, sans-serif', fontSize: '13px' }}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* MOBILE top bar */}
        <div className="md:hidden flex justify-content-between align-items-center px-4 w-full">
          {/* Menu button */}
          <div className="button-wrap" style={{ fontSize: '13px', zIndex: 110 }}>
            <button
              onClick={() => setIsMenuOpen(o => !o)}
              className="premium-btn"
              style={{ fontFamily: 'Epilogue, sans-serif' }}
              aria-label="Menu"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <List size={16} weight="bold" />
                Menu
              </span>
            </button>
            <div className="button-shadow" />
          </div>

          {/* Logo centered */}
          <button
            onClick={() => { navigate('/'); closeMenu(); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 0,
            }}
          >
            <img src={adiwarnaLogo} alt="Adiwarna" style={{ height: '32px', width: 'auto' }} />
          </button>

          {/* Login / Profile button for mobile top bar */}
          <div className="button-wrap" style={{ fontSize: '13px' }}>
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setIsMenuOpen(true);
                } else {
                  navigate('/login');
                }
              }}
              className="premium-btn"
              style={{ fontFamily: 'Epilogue, sans-serif' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} weight="bold" />
                {isAuthenticated ? 'Profile' : 'Login'}
              </span>
            </button>
            <div className="button-shadow" />
          </div>
        </div>
      </header>

      {/* MOBILE MENU — elegant slide-down panel */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          pointerEvents: isMenuOpen ? 'all' : 'none',
        }}
      >
        {/* Backdrop */}
        <div
          onClick={closeMenu}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(30,15,5,0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: isMenuOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Panel */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'var(--color-background)',
            borderRadius: '0 0 28px 28px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(-105%)',
            transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
            overflow: 'hidden',
            paddingBottom: '28px',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              height: '60px',
              borderBottom: '1px solid rgba(209,223,246,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={adiwarnaLogo} alt="Adiwarna" style={{ height: '32px', width: 'auto' }} />
              <span
                style={{
                  fontFamily: 'Epilogue, sans-serif',
                  fontWeight: 800,
                  fontSize: '15px',
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Adiwarna Fest 2026
              </span>
            </div>
            <button
              onClick={closeMenu}
              style={{
                width: '34px', height: '34px',
                background: 'rgba(209,223,246,0.08)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} weight="bold" color="var(--color-primary)" />
            </button>
          </div>

          {/* Nav items */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className="no-underline"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '999px',
                  background: isActive
                    ? 'linear-gradient(-75deg, rgba(161,64,0,0.12), rgba(254,178,70,0.45), rgba(161,64,0,0.12))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(161,64,0,0.4)' : '1px solid transparent',
                  boxShadow: isActive
                    ? 'inset 0 2px 2px rgba(255,255,255,0.6), inset 0 -2px 2px rgba(161,64,0,0.15), 0 4px 12px rgba(161,64,0,0.2)'
                    : 'none',
                  backdropFilter: isActive ? 'blur(8px)' : 'none',
                  WebkitBackdropFilter: isActive ? 'blur(8px)' : 'none',
                  color: isActive ? '#3a1800' : '#3d3d3d',
                  fontFamily: 'Epilogue, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  opacity: 0,
                  animation: isMenuOpen ? `menuFadeUp 0.35s ease forwards ${0.08 + index * 0.06}s` : 'none',
                  transition: 'background 0.15s, border-color 0.15s',
                })}
              >
                {({ isActive }) => (
                  <>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: isActive ? '#feb246' : 'rgba(254,178,70,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background 0.15s',
                      }}
                    >
                      <item.icon
                        size={20}
                        weight="fill"
                        color={isActive ? '#3a1800' : '#c89b6a'}
                      />
                    </div>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Mobile Profile Card */}
          {isAuthenticated && (
            <div 
              style={{ 
                margin: '12px 16px',
                padding: '16px', 
                borderRadius: '16px', 
                background: 'rgba(209,223,246,0.03)', 
                border: '1.5px solid rgba(209,223,246,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                animation: 'menuFadeUp 0.3s ease forwards 0.4s',
                opacity: 0,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: '#8c7166', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hello,</span>
                <span style={{ fontSize: '13px', color: '#1b1c1c', fontWeight: 800, wordBreak: 'break-all' }}>{email || username}</span>
              </div>
              
              <div className="button-wrap" style={{ fontSize: '14px', display: 'block' }}>
                <button
                  onClick={() => {
                    closeMenu();
                    signOut().then(() => navigate('/'));
                  }}
                  className="premium-btn"
                  style={{ fontFamily: 'Epilogue, sans-serif', display: 'block', width: '100%' }}
                >
                  <span style={{ textAlign: 'center' }}>Sign Out</span>
                </button>
                <div className="button-shadow" />
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              margin: '8px 20px 0',
              paddingTop: '16px',
              borderTop: '1px solid rgba(209,223,246,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: 'var(--color-accent)',
              }}
            />
            <span
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '11px',
                color: '#9ca3af',
                letterSpacing: '0.5px',
              }}
            >
              Xiamen University Malaysia · 2026
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes menuFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default TopNavbar;
