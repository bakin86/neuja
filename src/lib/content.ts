export const profile = {
  name: 'neuja',
  fullName: 'Dawaajargal',
  age: 19,
  role: 'Full-Stack / Creative Developer',
  year: '20.26',
  instagram: '1neuja',
  phone: '+976 95238963',
  phoneHref: '+97695238963',
  about: 'I am Dawaajargal, also known as neuja, a 19-year-old developer focused on building modern, interactive digital experiences.',
  focus: [
    'Creative frontend development',
    'Motion & animation',
    'Interactive web experiences',
    'Modern web technologies',
  ],
  education: 'Graduated from Indra Cyber Institute as a Full-Stack Developer with a 3.5 GPA.',
};
export type Act0 = {
  tag: string;
  theme: string;
  headline: string[];
  note: string;
  perimeter: {
    left: string;
    right: string;
    date: string;
    symbol: string;
  };
};

export type Act1 = {
  tag: string;
  theme: string;
  headline: string[];
  note: string;
  symmetry: {
    left: string;
    right: string;
    subtag: string;
  };
};

export type Act2 = {
  tag: string;
  theme: string;
  headline: string[];
  note: string;
  swiss: {
    indexLeft: string;
    indexRight: string;
    columns: Array<{ idx: string; desc: string }>;
  };
};

export type Act3 = {
  tag: string;
  theme: string;
  headline: string[];
  note: string;
  portal: {
    cta: string;
    status: string;
  };
};

export type Chapter = Act0 | Act1 | Act2 | Act3;

export const chapters: [Act0, Act1, Act2, Act3] = [
  {
    tag: '01 / THE SPARK',
    theme: 'theme-light',
    headline: ['A FEELING BEGINS', 'BEFORE CODE.'],
    note: 'Curiosity drives everything. Light, sound, tactile surfaces—before a single line of logic is written, an intuition takes shape.',
    perimeter: {
      left: 'INTUITION // TACTILE SURFACES',
      right: 'OPTICAL GLASS // BEFORE LOGIC',
      date: '2026 ARCHIVE',
      symbol: '+',
    },
  },
  {
    tag: '02 / THE EXPLORATION',
    theme: 'theme-dark',
    headline: ['FORM THROUGH', 'EXPERIMENTATION'],
    note: 'Prototypes, physics, chromatic dispersion. Wrestling with mathematics until numbers feel human and warm.',
    symmetry: {
      left: 'PHYSICS // FLUID DRAG',
      right: 'CHROMATIC // DISPERSION',
      subtag: 'PROTOTYPES // GLSL REFRACTION',
    },
  },
  {
    tag: '03 / THE FEELING',
    theme: 'theme-mint',
    headline: ['INTERACTION', 'THAT', 'LINGERS.'],
    note: 'Not just pretty pixels, but weight, friction, and memory. The digital world meeting tactile reality.',
    swiss: {
      indexLeft: '03',
      indexRight: '04',
      columns: [
        { idx: '01 // WEIGHT', desc: 'Pixels that possess mass & inertia' },
        { idx: '02 // FRICTION', desc: 'Tactile drag & kinetic resistance' },
        { idx: '03 // MEMORY', desc: 'Interactions that linger in mind' },
        { idx: '04 // SYSTEM', desc: 'Tokyo & Remote worldwide WebGL' },
      ],
    },
  },
  {
    tag: '04 / THE HORIZON',
    theme: 'theme-portal',
    headline: ['BUILDING WHAT', 'COMES NEXT.'],
    note: 'Selected commissions, creative code systems, and experiences that bridge the gap between design and depth.',
    portal: {
      cta: 'Let’s talk',
      status: 'AVAILABLE FOR SELECT COMMISSIONS, Q2 2026',
    },
  },
];



