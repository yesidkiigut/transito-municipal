export interface LogoPreset {
  id: string;
  nombre: string;
  categoria: string;
  svgDataUri: string;
}

// Generadores de SVG institucionales de alta definición convertidos a Data URI
const createShieldSvg = (color1: string, color2: string, text: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/>
      </filter>
    </defs>
    <path d="M 100 15 C 145 15 175 35 175 75 C 175 135 100 185 100 185 C 100 185 25 135 25 75 C 25 35 55 15 100 15 Z" fill="url(#grad1)" filter="url(#shadow)" stroke="#ffffff" stroke-width="4"/>
    <path d="M 100 25 C 138 25 163 42 163 75 C 163 125 100 168 100 168 C 100 168 37 125 37 75 C 37 42 62 25 100 25 Z" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
    <circle cx="100" cy="80" r="32" fill="#ffffff" opacity="0.15"/>
    <path d="M 80 88 L 100 60 L 120 88 Z" fill="#ffffff"/>
    <rect x="94" y="85" width="12" height="22" fill="#ffffff" rx="2"/>
    <circle cx="100" cy="65" r="4" fill="#fbbf24"/>
    <text x="100" y="132" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">${text}</text>
    <text x="100" y="145" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="rgba(255,255,255,0.85)" text-anchor="middle">TRANSITO</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createGovBadgeSvg = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="flag" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#FCD116;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#003893;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#CE1126;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="85" fill="#002855" stroke="#D4AF37" stroke-width="5"/>
    <circle cx="100" cy="100" r="75" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/>
    <path d="M 70 70 Q 100 50 130 70 L 125 115 Q 100 135 75 115 Z" fill="url(#flag)"/>
    <polygon points="100,55 104,66 116,66 107,73 110,84 100,77 90,84 93,73 84,66 96,66" fill="#D4AF37"/>
    <text x="100" y="155" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#D4AF37" text-anchor="middle" letter-spacing="1">ALCALDÍA</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createEcoShieldSvg = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <circle cx="100" cy="100" r="85" fill="#064e3b" stroke="#10b981" stroke-width="4"/>
    <path d="M 100 35 C 130 55 150 85 150 120 C 150 155 125 170 100 170 C 75 170 50 155 50 120 C 50 85 70 55 100 35 Z" fill="#059669" opacity="0.4"/>
    <path d="M 100 50 Q 135 80 120 120 Q 100 150 100 150 Q 100 150 80 120 Q 65 80 100 50 Z" fill="#34d399"/>
    <circle cx="100" cy="95" r="14" fill="#ffffff"/>
    <path d="M 94 95 L 98 99 L 107 90" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
    <text x="100" y="160" font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="#a7f3d0" text-anchor="middle" letter-spacing="1">ECO MOVILIDAD</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'shield-cyan-blue',
    nombre: 'Escudo Tecnológico Cyan & Zafiro',
    categoria: 'Moderno',
    svgDataUri: createShieldSvg('#06b6d4', '#1e40af', 'MOVILIDAD'),
  },
  {
    id: 'gov-colombia-badge',
    nombre: 'Emblema Institucional República',
    categoria: 'Gubernamental',
    svgDataUri: createGovBadgeSvg(),
  },
  {
    id: 'eco-green-shield',
    nombre: 'Escudo Ecológico & Sostenible',
    categoria: 'Ambiental',
    svgDataUri: createEcoShieldSvg(),
  },
  {
    id: 'shield-gold-navy',
    nombre: 'Escudo Distrital Oro & Real',
    categoria: 'Tradicional',
    svgDataUri: createShieldSvg('#d97706', '#1e1b4b', 'ALCALDÍA'),
  },
  {
    id: 'shield-crimson-ruby',
    nombre: 'Escudo Metropolitano Carmesí',
    categoria: 'Seguridad Vial',
    svgDataUri: createShieldSvg('#e11d48', '#881337', 'TRANSITO'),
  },
];
