import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';
import { List, House, Trophy, MapTrifold, User } from '@phosphor-icons/react';

const MobileHeader = () => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <div className="md:hidden sticky top-0 z-5 w-full" style={{ background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)', borderBottom: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <header className="flex justify-content-between align-items-center px-4 py-3 mx-auto w-full" style={{ maxWidth: '1024px' }}>
                    <button
                        onClick={() => setVisible(true)}
                        className="p-0 bg-transparent border-none cursor-pointer flex align-items-center"
                    >
                        <List size={28} color="var(--text-secondary)" weight="bold" />
                    </button>
                    <h1 className="m-0 text-xl font-bold font-epilogue" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Adiwarna Fest 2026</h1>
                    <div style={{ width: 28 }} />
                </header>
            </div>

            <Sidebar
                visible={visible}
                onHide={() => setVisible(false)}
                className="w-20rem"
                style={{
                    background: 'rgba(240,242,255,0.88)',
                    backdropFilter: 'blur(32px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                    borderRight: '1px solid rgba(255,255,255,0.75)',
                    boxShadow: '4px 0 32px rgba(0,0,0,0.08)',
                }}
            >
                <div className="flex flex-column h-full" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                    <h2 className="mt-0 mb-4 font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', fontSize: '20px' }}>Adiwarna Fest</h2>

                    <div className="flex flex-column gap-1 flex-grow-1">
                        {[
                            { to: '/', label: 'Home', icon: House },
                            { to: '/competition', label: 'Competition', icon: Trophy },
                            { to: '/map', label: 'Map', icon: MapTrifold },
                        ].map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                onClick={() => setVisible(false)}
                                className="flex align-items-center gap-3 text-decoration-none border-round-xl font-semibold"
                                style={({ isActive }) => ({
                                    padding: '11px 14px',
                                    color: isActive ? 'rgba(168,192,232,0.95)' : 'var(--text-secondary)',
                                    background: isActive ? 'rgba(209,223,246,0.1)' : 'transparent',
                                    fontWeight: isActive ? 700 : 600,
                                    transition: 'background 0.15s ease, color 0.15s ease',
                                })}
                            >
                                <Icon size={20} weight="fill" />
                                {label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(209,223,246,0.12)' }}>
                        <NavLink to="/login" onClick={() => setVisible(false)} className="glass-btn-indigo flex align-items-center justify-content-center gap-2 p-3 text-white font-bold text-decoration-none" style={{ borderRadius: '14px' }}>
                            <User size={20} weight="bold" />
                            Login / Register
                        </NavLink>
                    </div>
                </div>
            </Sidebar>
        </>
    );
};

export default MobileHeader;
