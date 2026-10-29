const svg = { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } as const;

export const BackIcon = () => <svg {...svg}><path d="M15 5l-7 7 7 7" /></svg>;

export const ArrowIcon = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg {...svg}><path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></svg>
);

export const LockIcon = () => (
  <svg {...svg} width={24} height={24} stroke-width={2}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);

export const HomeIcon = () => <svg {...svg}><path d="M4 11l8-7 8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></svg>;

export const SearchIcon = () => <svg {...svg}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>;

export const PrinterIcon = () => (
  <svg {...svg} width={44} height={44}>
    <path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><rect x="7" y="14" width="10" height="7" rx="1" fill="#fff" />
  </svg>
);

export const ShareIcon = () => (
  <svg {...svg} width={22} height={22} stroke-width={2.2}><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
);

export const DownloadIcon = () => (
  <svg {...svg} width={22} height={22} stroke-width={2.2}><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 19h14" /></svg>
);
