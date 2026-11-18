// Generates a simple placeholder portrait as an SVG string, so the app has no external image dependencies.

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function avatarSvg(id, name) {
  const h = hash(id + name);
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + (h % 70)) % 360;
  const headY = 150 + (h % 30);
  const initial = name.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue1} 65% 62%)"/>
      <stop offset="1" stop-color="hsl(${hue2} 60% 42%)"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <text x="300" y="${headY + 40}" text-anchor="middle" font-family="Georgia, serif" font-size="260" fill="#fff" fill-opacity="0.18">${initial}</text>
  <circle cx="300" cy="${headY + 120}" r="92" fill="#fff" fill-opacity="0.55"/>
  <path d="M110 800 C110 520 200 440 300 440 C400 440 490 520 490 800 Z" fill="#fff" fill-opacity="0.45"/>
</svg>
`;
}
