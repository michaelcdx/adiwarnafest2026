import basketballPortal from '../image/Basketball_Portal.jpg';
import futsalPortal from '../image/Futsal_Portal.jpg';
import mlbbPortal from '../image/MLBB_Portal.png';

// Map Directory Data
export const mapLocations = [
  {
    id: 'auditorium',
    title: 'Auditorium',
    subtitle: 'Tan Hua Choon Auditorium',
    date: '30 May 2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO4R3YGkfxURqsML6WK30S4x7p_vITXzbpsyMuSuxebKrtrO2XjopEZxZ9HnnnPnI_UO44u1qNDzf3-Zphwa4JsN4Hf9CtWDLMpdCZbMp5seV3TdbTtWbM5PXeCuP64egzO_WhDAwv_gIb5kZIiNDGJuxF1kvDtwdjesKZsKy0sQedPWq_G-uRDUc7_du2guW-XnKVJyyihMTkVhWNS3ZTuJW5-fqSHmbumJ7iJ2n2UcJgOc1IgnUa986jHckmVrtXeuLs2yT_aHE',
    events: [
      {
        name: 'Simfoni',
        date: '31 May 2026',
        venue: 'Tan Hua Choon Auditorium',
        description: 'Simfoni is the grand closing ceremony of Adiwarna Fest 2026. It is a vibrant and memorable awarding night that honors the achievements of athletes through music, live performances, and a celebration of Indonesian unity and culture.'
      }
    ]
  },
  {
    id: 'b1',
    title: 'B1 Area',
    subtitle: 'SPORTS AREA + VENDOR SPOTS',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    events: [
      {
        name: 'Indoor Bazaar',
        date: '30 May 2026',
        venue: 'B1 - Ground Floor and 1st Floor',
        type: 'bazaar'
      },
      {
        name: '5x5 Men Basketball',
        date: '30-31 May 2026',
        venue: 'B1 - Indoor Basketball',
        type: 'competition'
      },
      {
        name: 'Futsal Court',
        date: '30-31 May 2026',
        venue: 'B1 - Futsal Court',
        type: 'competition'
      }
    ]
  },
];

export const sportsSlides = [
  {
    image: basketballPortal,
    subtitle: '5x5 Men Basketball'
  },
  {
    image: futsalPortal,
    subtitle: 'Futsal Competition'
  },
  {
    image: mlbbPortal,
    subtitle: 'Mobile Legends Tournament'
  }
];

export const sportsDetails = [
  {
    id: '5x5',
    title: '5x5 Men Basketball',
    date: '30-31 May 2026',
    location: 'Xiamen University Malaysia',
    venue: 'B1 - Indoor Basketball Court',
    tnc: '#',
    fee: 'RM255/Team',
    prize: 'RM1,500',
    prizeBreakdown: [
      { rank: 'Champion', details: 'RM 800 + Medals + Certificate' },
      { rank: '1st Runner-up', details: 'RM 500 + Medals + Certificate' },
      { rank: '2nd Runner-up', details: 'RM 200 + Medals + Certificate' }
    ]
  },
  {
    id: 'futsal',
    title: 'Futsal Competition',
    date: '30-31 May 2026',
    location: 'Xiamen University Malaysia',
    venue: 'B1 - Futsal Court',
    tnc: '#',
    fee: 'RM205/Team',
    prize: 'RM1,000',
    prizeBreakdown: [
      { rank: 'Champion', details: 'RM 500 + Medals + Certificate' },
      { rank: '1st Runner-up', details: 'RM 300 + Medals + Certificate' },
      { rank: '2nd Runner-up', details: 'RM 200 + Medals + Certificate' }
    ]
  },
  {
    id: 'mlbb',
    title: 'Mobile Legends',
    date: '30 May 2026',
    location: 'Xiamen University Malaysia',
    venue: 'B1 - 1st Floor',
    tnc: '#',
    fee: 'RM55/Team',
    prize: 'RM500',
    prizeBreakdown: [
      { rank: 'Champion', details: 'RM 250 + E-Certificate' },
      { rank: '1st Runner-up', details: 'RM 150 + E-Certificate' },
      { rank: '2nd Runner-up', details: 'RM 100 + E-Certificate' }
    ]
  }
];

