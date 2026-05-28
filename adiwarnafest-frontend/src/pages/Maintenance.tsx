import { useNavigate } from 'react-router-dom'
import { ShieldCheck, UsersThree, Trophy, CalendarBlank, Download, GameController, Eye, QrCode } from '@phosphor-icons/react'
import { useAuth } from '../store/auth'

const Maintenance = () => {
  const navigate = useNavigate()
  const { role, username, signOut } = useAuth()
  const isAdmin = role === 'Admin'
  const isMaintainer = role === 'Maintainer'
  const canExport = isAdmin || isMaintainer

  const iconColor = '#A14000'
  const cards = [
    {
      icon: <UsersThree size={28} weight="bold" color={iconColor} />,
      title: 'Staff Users',
      description: 'Manage Admin and Maintainer accounts.',
      label: isAdmin ? 'Open Staff' : 'Admin only',
      disabled: !isAdmin,
      onClick: () => navigate('/maintenance/users'),
    },
    {
      icon: <UsersThree size={28} weight="bold" color={iconColor} />,
      title: 'Participants',
      description: 'Manage registered participants (Players).',
      label: 'Open Participants',
      disabled: false,
      onClick: () => navigate('/maintenance/participants'),
    },
    {
      icon: <Trophy size={28} weight="bold" color={iconColor} />,
      title: 'Teams',
      description: 'Manage teams and standings.',
      label: 'Open Teams',
      disabled: false,
      onClick: () => navigate('/maintenance/teams'),
    },
    {
      icon: <CalendarBlank size={28} weight="bold" color={iconColor} />,
      title: 'Tournaments',
      description: 'Manage tournaments and placements.',
      label: 'Open Tournaments',
      disabled: false,
      onClick: () => navigate('/maintenance/tournaments'),
    },
    {
      icon: <GameController size={28} weight="bold" color={iconColor} />,
      title: 'Games',
      description: 'Manage games and score updates within tournaments.',
      label: 'Open Games',
      disabled: false,
      onClick: () => navigate('/maintenance/games'),
    },
    {
      icon: <Eye size={28} weight="bold" color={iconColor} />,
      title: 'Live YouTube',
      description: 'Manage live YouTube stream links.',
      label: 'Open Live YouTube',
      disabled: false,
      onClick: () => navigate('/maintenance/live-youtube'),
    },
    {
      icon: <Download size={28} weight="bold" color={iconColor} />,
      title: 'Lucky Draw',
      description: 'Export participant entries.',
      label: canExport ? 'Open Lucky Draw' : 'Admin/Maintainer only',
      disabled: !canExport,
      onClick: () => navigate('/maintenance/lucky-draw'),
    },
    {
      icon: <QrCode size={28} weight="bold" color={iconColor} />,
      title: 'QR Tester',
      description: 'Generate and test booth QR codes.',
      label: canExport ? 'Open QR Tester' : 'Admin/Maintainer only',
      disabled: !canExport,
      onClick: () => navigate('/qr-tester'),
    }
  ];

  return (
    <div className="glass-page" style={{ fontFamily: 'Epilogue, sans-serif' }}>
      <div className="px-4 py-6 md:py-8 mx-auto w-full" style={{ maxWidth: '1280px' }}>
        {/* Header */}
        <header className="mb-8">
          <div className="flex align-items-center gap-3 mb-3">
            <ShieldCheck size={24} weight="bold" color="#A14000" />
            <div>
              <h1 className="m-0 text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Maintenance Dashboard
              </h1>
              <p className="m-0 text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Welcome, {username || 'User'} · <span style={{ fontWeight: '600', color: '#A14000' }}>{role || 'Unknown'}</span></p>
            </div>
          </div>
        </header>

        {/* Cards Grid */}
        <section className="grid gap-4 md:gap-6 mb-8">
          {cards.map((card, idx) => (
            <div key={idx} className="col-12 md:col-6 lg:col-6 xl:col-3">
              <div
                className="h-full p-5 flex flex-column gap-4 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.42)',
                  backdropFilter: 'blur(28px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.75)',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(-4px)';
                  el.style.background = 'rgba(255,255,255,0.62)';
                  el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.95)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = '';
                  el.style.background = 'rgba(255,255,255,0.42)';
                  el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)';
                }}
              >
                {/* Icon */}
                {card.icon}

                {/* Content */}
                <div className="flex-1">
                  <h2 className="m-0 text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {card.title}
                  </h2>
                  <p className="m-0 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {card.description}
                  </p>
                </div>

                {/* Button */}
                <button
                  disabled={card.disabled}
                  onClick={card.disabled ? undefined : card.onClick}
                  className="glass-btn-indigo w-full font-bold text-sm"
                  style={{
                    opacity: card.disabled ? 0.45 : 1,
                    cursor: card.disabled ? 'not-allowed' : 'pointer',
                    padding: '10px 16px',
                  }}
                >
                  {card.label}
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Sign Out Button */}
        <div className="flex gap-2" style={{ fontSize: '14px' }}>
          <div className="button-wrap">
            <button className="premium-btn" onClick={() => signOut().then(() => navigate('/'))} style={{ fontFamily: 'Epilogue, sans-serif' }}>
              <span>Sign Out</span>
            </button>
            <div className="button-shadow" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Maintenance
