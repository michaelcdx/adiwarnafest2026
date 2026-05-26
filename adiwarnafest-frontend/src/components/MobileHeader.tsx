import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';
import { List, House, Trophy, MapTrifold, User } from '@phosphor-icons/react';

const MobileHeader = () => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <div className="md:hidden sticky top-0 z-5 w-full" style={{ backgroundColor: 'rgba(250, 249, 246, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <header className="flex justify-content-between align-items-center px-4 py-3 mx-auto w-full" style={{ maxWidth: '1024px' }}>
                    <button 
                        onClick={() => setVisible(true)}
                        className="p-0 bg-transparent border-none cursor-pointer flex align-items-center"
                    >
                        <List size={28} color="var(--color-primary)" weight="bold" />
                    </button>
                    <h1 className="m-0 text-xl font-bold font-epilogue" style={{ color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>Adiwarna Fest 2026</h1>
                    <div style={{ width: 28 }}></div> {/* Spacer to keep title centered since avatar/hamburger take space */}
                </header>
            </div>

            <Sidebar visible={visible} onHide={() => setVisible(false)} className="w-20rem">
                <div className="flex flex-column h-full">
                    <h2 className="mt-0 mb-4 font-bold" style={{ color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>Adiwarna Fest</h2>
                    
                    <div className="flex flex-column gap-3 flex-grow-1">
                        <NavLink to="/" onClick={() => setVisible(false)} className={({ isActive }) => `flex align-items-center gap-3 p-3 border-round-lg text-decoration-none text-900 font-medium transition-colors ${isActive ? 'bg-orange-100' : 'hover:surface-100'}`}>
                            <House size={24} color="var(--color-primary)" weight="fill" />
                            Home
                        </NavLink>
                        <NavLink to="/competition" onClick={() => setVisible(false)} className={({ isActive }) => `flex align-items-center gap-3 p-3 border-round-lg text-decoration-none text-900 font-medium transition-colors ${isActive ? 'bg-orange-100' : 'hover:surface-100'}`}>
                            <Trophy size={24} color="var(--color-primary)" weight="fill" />
                            Competition
                        </NavLink>
                        <NavLink to="/map" onClick={() => setVisible(false)} className={({ isActive }) => `flex align-items-center gap-3 p-3 border-round-lg text-decoration-none text-900 font-medium transition-colors ${isActive ? 'bg-orange-100' : 'hover:surface-100'}`}>
                            <MapTrifold size={24} color="var(--color-primary)" weight="fill" />
                            Map
                        </NavLink>
                    </div>

                    <div className="mt-auto border-top-1 pt-4" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                        <NavLink to="/login" onClick={() => setVisible(false)} className="flex align-items-center justify-content-center gap-2 p-3 border-round-xl text-white font-bold text-decoration-none transition-transform hover:-translate-y-1" style={{ backgroundColor: 'var(--color-primary)' }}>
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
