/**
 * REVA UNIVERSITY - CAMPUS LOST & FOUND INITIAL DATA & CAMPUS LANDMARKS
 * Coordinates centered at: 13.1167° N, 77.6346° E (Yelahanka, Bangalore)
 */

export const REVA_CAMPUS_CENTER = {
  lat: 13.1167,
  lng: 77.6346,
  zoom: 17
};

export const REVA_LANDMARKS = [
  { id: 'all', name: 'All Campus Spots', lat: 13.1167, lng: 77.6346 },
  { id: 'library', name: 'Central Library', lat: 13.1169, lng: 77.6348, desc: 'Kalpana Chawla Block' },
  { id: 'science', name: 'Science & Tech Block', lat: 13.1171, lng: 77.6339, desc: 'C.V. Raman Block' },
  { id: 'canteen', name: 'Food Court & Canteen', lat: 13.1175, lng: 77.6352, desc: 'Campus Food Street' },
  { id: 'auditorium', name: 'Kuvempu Auditorium', lat: 13.1158, lng: 77.6338, desc: 'Main Convention Hall' },
  { id: 'admin', name: 'Admin Block', lat: 13.1162, lng: 77.6342, desc: 'Sir M.V. Block & Accounts' },
  { id: 'amphitheatre', name: 'Gazebo & Amphitheatre', lat: 13.1164, lng: 77.6359, desc: 'Central Green Lawns' },
  { id: 'sports', name: 'Sports Complex', lat: 13.1180, lng: 77.6341, desc: 'Indoor Stadium & Courts' },
  { id: 'arch', name: 'School of Architecture', lat: 13.1153, lng: 77.6351, desc: 'Design Studios & Labs' }
];

export const INITIAL_ITEMS = [
  {
    id: 'item-reva-001',
    type: 'lost',
    title: 'Apple AirPods Pro (2nd Gen) in White Case',
    category: 'electronics',
    landmark: 'Central Library',
    locationDetail: '2nd Floor Quiet Study Section, Carrel #14',
    lat: 13.1169,
    lng: 77.6348,
    dateReported: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    description: 'White MagSafe charging case with a small royal blue silicone clip. Minor faint scratch on the bottom right corner.',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&q=80',
    status: 'active',
    reporterName: 'Aarav Sharma',
    reporterSrn: 'R22CS104',
    reporterPhone: '+91 98451 28941',
    reporterEmail: 'aarav.s@reva.edu.in'
  },
  {
    id: 'item-reva-002',
    type: 'found',
    title: 'Casio FX-991EX ClassWiz Calculator',
    category: 'electronics',
    landmark: 'Science & Tech Block',
    locationDetail: 'Room 304 (Digital Electronics Lab), Bench 4',
    lat: 13.1171,
    lng: 77.6339,
    dateReported: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    description: 'Authentic Casio ClassWiz solar calculator with silver faceplate and a small sticker of "Matrix/Fourier" on the hard cover.',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=700&q=80',
    status: 'active',
    reporterName: 'Raghu M. (Lab Attendant)',
    reporterSrn: 'STAFF-EE12',
    reporterPhone: '+91 94482 17390',
    reporterEmail: 'raghu.lab@reva.edu.in'
  },
  {
    id: 'item-reva-003',
    type: 'found',
    title: 'REVA Student Smart ID Card + Maroon Lanyard',
    category: 'documents',
    landmark: 'Food Court & Canteen',
    locationDetail: 'Central Canteen Table #8 near Fresh Juice counter',
    lat: 13.1175,
    lng: 77.6352,
    dateReported: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    description: 'RFID smart student card belonging to Rohan Verma, Dept of Mechanical Engineering. Handed over to the manager desk.',
    image: 'https://images.unsplash.com/photo-1589330694653-dad6ef0140be?auto=format&fit=crop&w=700&q=80',
    status: 'active',
    reporterName: 'Sunil Kumar (Canteen Supervisor)',
    reporterSrn: 'ADMIN-FC03',
    reporterPhone: '+91 98860 34211',
    reporterEmail: 'canteen.manager@reva.edu.in'
  },
  {
    id: 'item-reva-004',
    type: 'lost',
    title: 'Titan Octane Chronograph Watch (Silver Dial)',
    category: 'clothing',
    landmark: 'Gazebo & Amphitheatre',
    locationDetail: 'Stone steps facing the central stage lawn',
    lat: 13.1164,
    lng: 77.6359,
    dateReported: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    description: 'Solid stainless steel chronograph watch with blue subdials and butterfly deployment clasp. Lost during evening hackathon gathering.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
    status: 'active',
    reporterName: 'Ananya Patel',
    reporterSrn: 'R23EC215',
    reporterPhone: '+91 87629 55102',
    reporterEmail: 'ananya.ec@reva.edu.in'
  },
  {
    id: 'item-reva-005',
    type: 'lost',
    title: 'Wildcraft Obsidian Black Laptop Backpack',
    category: 'bags',
    landmark: 'Kuvempu Auditorium',
    locationDetail: 'Auditorium Main Hall, Row H, Seat #12',
    lat: 13.1158,
    lng: 77.6338,
    dateReported: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    description: 'Black backpack containing a Dell 65W USB-C charger, stainless steel Milton thermos, and a Data Structures & Algorithms notebook.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80',
    status: 'active',
    reporterName: 'Nikhil Gowda',
    reporterSrn: 'R22IS045',
    reporterPhone: '+91 99014 62890',
    reporterEmail: 'nikhil.g@reva.edu.in'
  },
  {
    id: 'item-reva-006',
    type: 'found',
    title: 'Ring with 3 Keys & Royal Enfield Bullet Keychain',
    category: 'keys',
    landmark: 'Admin Block',
    locationDetail: 'Flight of stairs leading to Central Accounts Office',
    lat: 13.1162,
    lng: 77.6342,
    dateReported: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    description: 'Two brass Godrej cabinet keys, one motorcycle ignition key with heavy metallic vintage Royal Enfield crest keychain.',
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=700&q=80',
    status: 'active',
    reporterName: 'Suresh M. (Campus Security)',
    reporterSrn: 'SEC-GATE01',
    reporterPhone: '+91 91104 88320',
    reporterEmail: 'security.reva@reva.edu.in'
  },
  {
    id: 'item-reva-007',
    type: 'lost',
    title: 'Staedtler Architectural Drafting Pen Set',
    category: 'books',
    landmark: 'School of Architecture',
    locationDetail: 'Studio B3 drafting tables',
    lat: 13.1153,
    lng: 77.6351,
    dateReported: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    description: 'Black zippered case with triangular scale ruler, 0.1/0.3/0.5/0.8 technical pens, and mechanical drafting pencil.',
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=700&q=80',
    status: 'reunited',
    reporterName: 'Tanvi Rao',
    reporterSrn: 'R23AR012',
    reporterPhone: '+91 94803 71924',
    reporterEmail: 'tanvi.rao@reva.edu.in'
  },
  {
    id: 'item-reva-008',
    type: 'found',
    title: 'Decathlon Matte Navy Sports Bottle',
    category: 'others',
    landmark: 'Sports Complex',
    locationDetail: 'Indoor Badminton Court #2 Bench',
    lat: 13.1180,
    lng: 77.6341,
    dateReported: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    description: '800ml insulated stainless sports bottle with Kipsta wristband attached to the handle.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80',
    status: 'reunited',
    reporterName: 'Coach Pradeep Kumar',
    reporterSrn: 'DEPT-SPORTS',
    reporterPhone: '+91 97401 22849',
    reporterEmail: 'sports.desk@reva.edu.in'
  }
];

export const PRESET_SAMPLE_PHOTOS = [
  { name: 'AirPods Pro', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&q=80' },
  { name: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=700&q=80' },
  { name: 'ID Card Badge', url: 'https://images.unsplash.com/photo-1589330694653-dad6ef0140be?auto=format&fit=crop&w=700&q=80' },
  { name: 'Keys & Ring', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=700&q=80' },
  { name: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80' },
  { name: 'Wrist Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80' }
];
