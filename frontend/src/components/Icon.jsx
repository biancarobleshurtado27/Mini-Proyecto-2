const paths = {
  home: 'M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9Z M9 21v-6h6v6',
  bot: 'M7 9V7a5 5 0 0 1 10 0v2 M5 9h14a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a2 2 0 0 1 2-2Z M8 14h.01 M16 14h.01 M9 18h6',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z M4 19h16',
  briefcase: 'M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7 M3 8h18v11H3z M3 12h18 M10 12v2h4v-2',
  help: 'M9.3 9a2.8 2.8 0 1 1 4.9 1.9c-.8.8-2.2 1.5-2.2 3.1 M12 18h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  grid: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  search: 'm21 21-4.4-4.4 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  pin: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 10h.01',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  logout: 'M10 17l5-5-5-5 M15 12H3 M21 3v18',
  shield: 'M12 3 20 6v5c0 5.1-3.3 8.8-8 10-4.7-1.2-8-4.9-8-10V6l8-3Z M9 12l2 2 4-4',
  verified: 'M12 3 14.3 5l3-.3.7 3.1L21 10l-1.8 2.6.1 3.2-3.1.8-2.2 2.3-2.8-1.5-2.8 1.5-2.2-2.3-3.1-.8.1-3.2L3 10l2.7-2.2L6.4 4.7l3 .3L12 3Z M9 11.5l2 2 4-4',
  document: 'M6 3h8l4 4v14H6z M14 3v5h5 M9 13h6 M9 17h6',
  at: 'M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8 M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  lock: 'M7 11V7a5 5 0 0 1 10 0v4 M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z M12 15v3',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M9.88 9.88a3 3 0 1 0 4.24 4.24 M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68 M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61 M2 2l20 20',
  arrowRight: 'M5 12h14 M12 5l7 7-7 7',
  bolt: 'M13 2 3 14h8l-2 8 11-12h-8l2-8Z',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  scale: 'M16 16l3-8 3 8a3 3 0 0 1-6 0 M2 16l3-8 3 8a3 3 0 0 1-6 0 M7 21h10 M12 3v18 M3 7h18',
  admin: 'M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 5a3 3 0 0 1 6 0v3H9V7Zm3 7a2 2 0 1 1-2 2 2 2 0 0 1 2-2Z',
  checkCircle: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3',
  shieldSecurity: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M12 8v4 M12 16h.01'
}

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      className={`ui-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.help} />
    </svg>
  )
}
