/**
 * Landing hero illustration - 3 stacked books + pen cup + plant.
 * Hand-drawn SVG matching the design's hero image - no external assets,
 * so it renders perfectly offline and in previews.
 */
const LandingIllustration = ({ className }) => (
  <svg viewBox="0 0 420 340" className={className} role="img" aria-label="Stacked books with pens and a plant">
    <defs>
      <linearGradient id="blob" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
      <linearGradient id="bookA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="bookB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
      <linearGradient id="cup" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1D4ED8" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>

    {/* background blob */}
    <path
      d="M60 300C10 250 0 170 40 110 82 46 170 6 258 22c86 16 150 84 152 164 2 78-60 132-140 142-62 8-160-4-210-28Z"
      fill="url(#blob)"
    />

    {/* shadow */}
    <ellipse cx="205" cy="305" rx="130" ry="14" fill="#CBD5E1" opacity=".45" />

    {/* book 3 (bottom) */}
    <g>
      <rect x="70" y="248" width="270" height="42" rx="10" fill="url(#bookB)" />
      <rect x="70" y="248" width="270" height="10" rx="5" fill="#1E40AF" />
      <rect x="96" y="266" width="52" height="6" rx="3" fill="#93C5FD" opacity=".75" />
      <rect x="256" y="252" width="72" height="34" rx="6" fill="#F8FAFC" opacity=".92" />
      <path d="M262 262h58M262 270h44M262 278h50" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* book 2 (middle) */}
    <g>
      <rect x="86" y="212" width="240" height="40" rx="10" fill="url(#bookA)" />
      <rect x="86" y="212" width="240" height="9" rx="4.5" fill="#1E40AF" />
      <rect x="110" y="228" width="44" height="6" rx="3" fill="#BFDBFE" opacity=".8" />
      <rect x="252" y="216" width="64" height="32" rx="6" fill="#F8FAFC" opacity=".92" />
      <path d="M258 226h50M258 234h38" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* book 1 (top) */}
    <g>
      <rect x="102" y="176" width="212" height="40" rx="10" fill="#60A5FA" />
      <rect x="102" y="176" width="212" height="9" rx="4.5" fill="#2563EB" />
      <rect x="124" y="192" width="40" height="6" rx="3" fill="#EFF6FF" opacity=".9" />
      <rect x="248" y="180" width="56" height="32" rx="6" fill="#F8FAFC" opacity=".95" />
      <path d="M254 190h44M254 198h32" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* pen cup */}
    <g>
      <path d="M196 120h58l-7 58a10 10 0 0 1-10 9h-24a10 10 0 0 1-10-9l-7-58Z" fill="url(#cup)" />
      <path d="M196 120h58l-2 16h-54l-2-16Z" fill="#1E3A8A" />
      {/* pens */}
      <rect x="205" y="70" width="9" height="54" rx="4.5" fill="#0F172A" />
      <path d="M205 70h9l-4.5-11L205 70Z" fill="#F8FAFC" />
      <rect x="222" y="60" width="9" height="64" rx="4.5" fill="#1E40AF" />
      <path d="M222 60h9l-4.5-11L222 60Z" fill="#FBBF24" />
      <rect x="239" y="76" width="9" height="48" rx="4.5" fill="#2563EB" />
      <path d="M239 76h9l-4.5-10L239 76Z" fill="#E2E8F0" />
    </g>

    {/* plant */}
    <g>
      <path d="M320 208c14-26 12-52 6-70" stroke="#059669" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M326 150c-22-6-34-24-32-46 24 2 40 18 42 42l-10 4Z" fill="url(#leaf)" />
      <path d="M330 168c22-2 38-16 44-38-24-4-44 8-52 30l8 8Z" fill="#34D399" />
      <path d="M322 196c-20 4-38-4-48-22 20-10 42-4 54 14l-6 8Z" fill="#059669" opacity=".85" />
      <path d="M300 232h52l-8 46a8 8 0 0 1-8 7h-20a8 8 0 0 1-8-7l-8-46Z" fill="#1E40AF" />
      <path d="M296 224h60a5 5 0 0 1 0 10h-60a5 5 0 0 1 0-10Z" fill="#2563EB" />
      <path d="M318 150v-16" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* sparkles */}
    <path d="M96 96l6 14 14 6-14 6-6 14-6-14-14-6 14-6 6-14Z" fill="#93C5FD" opacity=".9" />
    <circle cx="356" cy="92" r="5" fill="#BFDBFE" />
    <circle cx="150" cy="56" r="4" fill="#DBEAFE" />
  </svg>
);

export default LandingIllustration;
