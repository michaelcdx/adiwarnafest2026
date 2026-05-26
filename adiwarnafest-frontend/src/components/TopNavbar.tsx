import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { House, Trophy, MapTrifold, UsersThree, X, User, Wrench, Sparkle } from '@phosphor-icons/react';
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
          backgroundColor: 'rgba(251, 249, 248, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(144,77,0,0.08)',
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
                fontWeight: 800,
                fontSize: '17px',
                color: 'var(--color-primary)',
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
                  borderRadius: '10px',
                  background: isActive ? 'rgba(144,77,0,0.1)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : '#6b7280',
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
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setIsProfileOpen(prev => !prev);
                  } else {
                    navigate('/login');
                  }
                }}
                style={{
                  marginLeft: '12px',
                  padding: '8px 20px',
                  borderRadius: '12px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontFamily: 'Epilogue, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(144,77,0,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(144,77,0,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(144,77,0,0.25)';
                }}
              >
                <div className="flex align-items-center gap-2">
                  <User size={18} weight="bold" />
                  {isAuthenticated ? 'Profile' : 'Login'}
                </div>
              </button>

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
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(144,77,0,0.08)',
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
                    
                    <div style={{ height: '1px', backgroundColor: 'rgba(144,77,0,0.08)' }} />
                    
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut().then(() => navigate('/'));
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: '#FAF9F6',
                        color: 'var(--color-primary)',
                        border: '1.5px solid rgba(144,77,0,0.15)',
                        fontFamily: 'Epilogue, sans-serif',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(144,77,0,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FAF9F6';
                      }}
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
          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(o => !o)}
            style={{
              width: '40px',
              height: '40px',
              background: isMenuOpen ? 'rgba(144,77,0,0.1)' : 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: 0,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 110,
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
            aria-label="Menu"
          >
            <span style={{
              display: 'block',
              width: '20px', height: '2px',
              background: 'var(--color-primary)',
              borderRadius: '2px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isMenuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              display: 'block',
              width: isMenuOpen ? '0' : '14px', height: '2px',
              background: 'var(--color-primary)',
              borderRadius: '2px',
              alignSelf: 'flex-start',
              marginLeft: isMenuOpen ? '0' : '10px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isMenuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block',
              width: '20px', height: '2px',
              background: 'var(--color-primary)',
              borderRadius: '2px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isMenuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
            }} />
          </button>

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

          {/* Login icon/button for mobile top bar */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                setIsMenuOpen(true);
              } else {
                navigate('/login');
              }
            }}
            style={{
              width: '40px',
              height: '40px',
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <User size={20} weight="bold" />
          </button>
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
              borderBottom: '1px solid rgba(144,77,0,0.08)',
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
                background: 'rgba(144,77,0,0.08)',
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
                  borderRadius: '14px',
                  background: isActive ? 'rgba(144,77,0,0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(144,77,0,0.15)' : '1px solid transparent',
                  color: isActive ? 'var(--color-primary)' : '#3d3d3d',
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
                        background: isActive ? 'var(--color-primary)' : 'rgba(144,77,0,0.08)',
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
                        color={isActive ? 'white' : 'var(--color-primary)'}
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
                background: 'rgba(144,77,0,0.03)', 
                border: '1.5px solid rgba(144,77,0,0.08)',
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
              
              <button
                onClick={() => {
                  closeMenu();
                  signOut().then(() => navigate('/'));
                }}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontFamily: 'Epilogue, sans-serif',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(144,77,0,0.2)',
                }}
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              margin: '8px 20px 0',
              paddingTop: '16px',
              borderTop: '1px solid rgba(144,77,0,0.08)',
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
