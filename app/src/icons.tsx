const svg = { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } as const;

export const BackIcon = () => <svg {...svg}><path d="M15 5l-7 7 7 7" /></svg>;

export const ArrowIcon = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg {...svg}><path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></svg>
);

export const LockIcon = () => (
  <svg {...svg} width={24} height={24} stroke-width={2}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);

export const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg {...svg} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
);

export const PrinterIcon = () => (
  <svg {...svg} width={44} height={44}>
    <path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><rect x="7" y="14" width="10" height="7" rx="1" fill="#fff" />
  </svg>
);
