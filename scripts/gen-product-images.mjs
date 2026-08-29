#!/usr/bin/env node
/**
 * ABS Network Broadband — generate realistic product renderings
 * Creates professional, original product renderings for the demo catalog
 * products and rasterizes them to 1600x1600 WebP via sharp.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SIZE = 1600;
const OUT = resolve('render-out');
mkdirSync(OUT, { recursive: true });

const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
const TAIL = `</svg>`;

const DEFS = `
<defs>
  <filter id="sb30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="sb18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="sb10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="sb6"  x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="sb2"  x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>

  <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f7f9fc"/><stop offset="55%" stop-color="#eef2f8"/><stop offset="100%" stop-color="#e2e8f2"/>
  </linearGradient>

  <linearGradient id="pWhite" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#f1f4f9"/><stop offset="100%" stop-color="#cdd6e4"/>
  </linearGradient>

  <linearGradient id="pDark" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#39424f"/><stop offset="50%" stop-color="#212834"/><stop offset="100%" stop-color="#12161d"/>
  </linearGradient>

  <linearGradient id="pBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#4c8df8"/><stop offset="100%" stop-color="#1d4ed8"/>
  </linearGradient>

  <linearGradient id="metalG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#edf1f7"/><stop offset="45%" stop-color="#b2bed4"/><stop offset="100%" stop-color="#7e8ba4"/>
  </linearGradient>

  <linearGradient id="metalDarkG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#6d7889"/><stop offset="50%" stop-color="#3a4453"/><stop offset="100%" stop-color="#1e242d"/>
  </linearGradient>

  <radialGradient id="ledGreen" cx="0.4" cy="0.4" r="0.7"><stop offset="0%" stop-color="#eafff4"/><stop offset="45%" stop-color="#34d399"/><stop offset="100%" stop-color="#068a5c"/></radialGradient>
  <radialGradient id="ledBlue" cx="0.4" cy="0.4" r="0.7"><stop offset="0%" stop-color="#eaf4ff"/><stop offset="45%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#245edc"/></radialGradient>
  <radialGradient id="ledAmber" cx="0.4" cy="0.4" r="0.7"><stop offset="0%" stop-color="#fff7e0"/><stop offset="45%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></radialGradient>
  <radialGradient id="ledRed" cx="0.4" cy="0.4" r="0.7"><stop offset="0%" stop-color="#ffe4e6"/><stop offset="45%" stop-color="#f87171"/><stop offset="100%" stop-color="#dc2626"/></radialGradient>
</defs>`;

function frame(inner) {
  return HEAD(SIZE, SIZE) + DEFS + `<rect width="${SIZE}" height="${SIZE}" fill="url(#bgG)"/>` + inner + TAIL;
}
function shadow(cx, cy, rx, ry, blur, op) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#0a1730" opacity="${op}" filter="url(#sb${blur})"/>`;
}
function led(cx, cy, r, grad) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${grad}"/><circle cx="${cx}" cy="${cy + r * 0.25}" r="${r * 0.45}" fill="#ffffff" opacity="0.8"/>`;
}

/* =========================================================================
   1. AX3000 Dual-Band Wi-Fi 6 Router (2 tall antennas, tilted chassis)
   ========================================================================= */
function router() {
  return frame(`
    ${shadow(800, 1260, 570, 95, 30, 0.16)}

    <g transform="rotate(-5 800 750)">
      <!-- left antenna -->
      <g transform="translate(270,360)">
        <rect x="-18" y="-140" width="36" height="150" rx="14" fill="#161d28"/>
        <rect x="-18" y="-300" width="36" height="160" rx="14" fill="url(#metalDarkG)"/>
        <circle cx="0" cy="-290" r="13" fill="#0c1118"/>
      </g>
      <!-- right antenna -->
      <g transform="translate(1330,360)">
        <rect x="-18" y="-140" width="36" height="150" rx="14" fill="#161d28"/>
        <rect x="-18" y="-300" width="36" height="160" rx="14" fill="url(#metalDarkG)"/>
        <circle cx="0" cy="-290" r="13" fill="#0c1118"/>
      </g>

      <!-- chassis -->
      <ellipse cx="800" cy="975" rx="470" ry="78" fill="#b9c3d4"/>
      <rect x="330" y="640" width="940" height="320" rx="62" fill="url(#pWhite)"/>
      <path d="M330 690 q470 -110 940 0 l0 60 q-470 -100 -940 0 z" fill="#ffffff" opacity="0.55"/>

      <!-- top dark bezel -->
      <rect x="330" y="640" width="940" height="150" rx="62" fill="url(#pDark)"/>
      <rect x="372" y="666" width="250" height="62" rx="16" fill="#06090d" opacity="0.55"/>
      <text x="404" y="706" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="bold" fill="#7fd0ff" letter-spacing="3">ABS</text>
      <text x="664" y="706" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="600" fill="#b6c0d0">AX3000</text>

      <!-- LEDs -->
      ${led(760, 760, 15, 'url(#ledBlue)')}
      ${led(820, 760, 15, 'url(#ledAmber)')}
      ${led(880, 760, 15, 'url(#ledGreen)')}
      ${led(940, 760, 15, 'url(#ledBlue)')}

      <!-- ethernet ports -->
      ${[0,1,2,3].map((i) => ethernetPort(1180 + i * 88, 800, 72, 78, true)).join('')}

      <!-- front vents + brand plate -->
      <g fill="#0e141d">${[0,1,2,3].map((i) => `<rect x="${620 + i * 52}" y="850" width="32" height="9" rx="4"/>`).join('')}</g>
      <g fill="#0e141d">${[0,1,2,3].map((i) => `<rect x="${620 + i * 52}" y="874" width="32" height="9" rx="4"/>`).join('')}</g>
      <rect x="380" y="830" width="200" height="64" rx="14" fill="#1b2331"/>
      <text x="402" y="862" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="bold" fill="#dbe3ef">ABS NETWORK</text>
      <text x="404" y="884" font-family="Arial,Helvetica,sans-serif" font-size="17" fill="#7b8aa3">Wi-Fi 6 Router</text>
    </g>
  `);
}

/* =========================================================================
   2. GPON ONT 1GE (wall-mount fiber terminal)
   ========================================================================= */
function ont() {
  return frame(`
    ${shadow(800, 1200, 420, 70, 30, 0.16)}
    <g transform="rotate(-2 800 750)">
      <!-- body -->
      <rect x="340" y="600" width="920" height="520" rx="64" fill="url(#pWhite)"/>
      <path d="M340 660 q460 -100 920 0 l0 30 q-460 -90 -920 0 z" fill="#ffffff" opacity="0.6"/>

      <!-- top plate (dark) -->
      <rect x="368" y="628" width="220" height="116" rx="22" fill="#0d1219"/>
      <text x="396" y="690" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="bold" fill="#7fd0ff" letter-spacing="2">ABS GPON</text>
      <text x="398" y="722" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#7f8da3">ONT · 1GE</text>

      <!-- power status leds -->
      ${led(680, 668, 14, 'url(#ledGreen)')}
      ${[0,1,2].map((i) => led(744 + i * 46, 668, 14, 'url(#ledGreen)')).join('')}

      <!-- fiber port -->
      <g transform="translate(1140,640)">
        <rect x="0" y="0" width="120" height="80" rx="14" fill="url(#metalDarkG)"/>
        <circle cx="60" cy="44" r="20" fill="#0a0f16"/>
        <circle cx="60" cy="44" r="9" fill="#5b8bff"/>
        <text x="60" y="30" font-family="Arial,Helvetica,sans-serif" font-size="16" fill="#cbd5e1" text-anchor="middle">FIBER</text>
      </g>

      <!-- gigabit ethernet port -->
      ${ethernetPort(1036, 780, 176, 92, true)}

      <!-- vents -->
      <g fill="#0e141d">${[0,1,2,3,4].map((i) => `<rect x="${380 + i * 40}" y="980" width="24" height="9" rx="4"/>`).join('')}</g>
      <g fill="#0e141d">${[0,1,2,3,4].map((i) => `<rect x="${380 + i * 40}" y="1004" width="24" height="9" rx="4"/>`).join('')}</g>

      <!-- brand plate -->
      <rect x="760" y="800" width="220" height="70" rx="14" fill="#1b2331"/>
      <text x="784" y="838" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="bold" fill="#dbe3ef">ABS NETWORK</text>
      <text x="786" y="860" font-family="Arial,Helvetica,sans-serif" font-size="17" fill="#7b8aa3">FTTH Terminal</text>
    </g>
  `);
}

/* =========================================================================
   3. 24-Port Gigabit Managed L2+ Switch (1U rack, front ports)
   ========================================================================= */
function switch24() {
  const ports = [];
  for (let i = 0; i < 24; i++) {
    const x = 356 + (i % 12) * 56;
    const y = i < 12 ? 760 : 872;
    ports.push(ethernetPort(x, y, 42, 64, false));
  }
  return frame(`
    ${shadow(800, 1210, 620, 70, 30, 0.16)}
    <!-- ears -->
    <rect x="260" y="648" width="90" height="150" rx="12" fill="url(#metalG)"/>
    <rect x="1250" y="648" width="90" height="150" rx="12" fill="url(#metalG)"/>
    <!-- chassis -->
    <rect x="320" y="640" width="960" height="170" rx="18" fill="url(#metalDarkG)"/>
    <rect x="320" y="640" width="960" height="34" rx="18" fill="url(#pDark)"/>
    <!-- top label -->
    <text x="352" y="668" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="bold" fill="#9fb2cf">ABS NETWORK · 24-PORT GIGABIT MANAGED</text>
    ${ports.join('')}

    <!-- left management block -->
    ${ethernetPort(356, 1000, 120, 76, false)}
    ${ethernetPort(492, 1000, 120, 76, false)}
    <rect x="640" y="1000" width="120" height="76" rx="6" fill="#0a0f16"/>
    <text x="660" y="1042" font-family="Arial,Helvetica,sans-serif" font-size="18" fill="#6b7a92">LED</text>

    <!-- LEDs per port pair -->
    ${[0,1,2,3,4,5].map((i) => led(386 + i * 112, 730, 7, 'url(#ledGreen)')).join('')}
    ${[0,1,2,3,4,5].map((i) => led(386 + i * 112, 838, 7, 'url(#ledGreen)')).join('')}

    <!-- SFP uplinks -->
    ${sfpPort(1180, 1000, 92, 76)}
    <rect x="380" y="1000" width="150" height="76" rx="8" fill="url(#pBlue)"/>
    <text x="408" y="1042" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="bold" fill="#ffffff">SFP+</text>
  `);
}

/* =========================================================================
   4. AC1200 Ceiling Access Point (round ceiling AP)
   ========================================================================= */
function ap() {
  return frame(`
    ${shadow(800, 1200, 420, 90, 30, 0.16)}
    <g transform="rotate(-3 800 720)">
      <circle cx="800" cy="720" r="400" fill="url(#pWhite)"/>
      <circle cx="800" cy="720" r="400" fill="none" stroke="#c8d2e1" stroke-width="6"/>
      <circle cx="800" cy="720" r="292" fill="none" stroke="#dfe6f0" stroke-width="3"/>
      ${Array.from({length: 10}, (_, i) => {
        const a = (Math.PI / 5) * i - Math.PI / 2;
        const r1 = 320, r2 = 380;
        const x1 = 800 + r1 * Math.cos(a), y1 = 720 + r1 * Math.sin(a);
        const x2 = 800 + r2 * Math.cos(a), y2 = 720 + r2 * Math.sin(a);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#dfe6f0" stroke-width="4" stroke-linecap="round"/>`;
      }).join('')}
      <circle cx="800" cy="720" r="250" fill="#f4f7fb" stroke="#dbe3ef" stroke-width="2"/>

      <!-- central ring / brand -->
      <circle cx="800" cy="720" r="150" fill="#1a2230"/>
      <text x="800" y="706" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="bold" fill="#7fd0ff" text-anchor="middle" letter-spacing="2">ABS</text>
      <text x="800" y="746" font-family="Arial,Helvetica,sans-serif" font-size="24" fill="#9fb2cf" text-anchor="middle">ACCESS POINT</text>

      <!-- LEDs -->
      ${led(800, 560, 12, 'url(#ledGreen)')}
      ${led(640, 720, 12, 'url(#ledBlue)')}
      ${led(800, 480, 12, 'url(#ledAmber)')}

      <!-- ethernet on rear edge -->
      ${[0,1].map((i) => ethernetPort(820 + i * 70, 1050, 56, 52, false)).join('')}
    </g>
  `);
}

/* =========================================================================
   5. Cat6 UTP LAN Cable (305m box spool)
   ========================================================================= */
function cat6() {
  return frame(`
    ${shadow(800, 1240, 520, 80, 30, 0.16)}
    <!-- spool outer down -->
    <circle cx="800" cy="720" r="450" fill="#b98a41"/>
    <circle cx="800" cy="720" r="450" fill="none" stroke="#a97a33" stroke-width="10"/>
    <circle cx="800" cy="720" r="330" fill="#a4752f"/>
    <!-- cable windings -->
    ${Array.from({length: 26}, (_, i) => {
      const r = 350 + (i % 7) * 12;
      const a0 = (i * 55) * Math.PI / 180;
      return `<path d="M ${800 + r * Math.cos(a0)} ${720 + r * Math.sin(a0)} q 60 18 120 0 q 60 -18 120 0" stroke="#3b7fd4" stroke-width="13" fill="none" stroke-linecap="round"/>`;
    }).join('')}
    <!-- hub -->
    <circle cx="800" cy="720" r="180" fill="url(#pWhite)"/>
    <circle cx="800" cy="720" r="120" fill="#1c2636"/>
    <text x="800" y="706" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="bold" fill="#7fd0ff" text-anchor="middle" letter-spacing="2">ABS</text>
    <text x="800" y="744" font-family="Arial,Helvetica,sans-serif" font-size="26" fill="#cfd9e8" text-anchor="middle">Cat6 UTP</text>
    <text x="800" y="776" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#7f8ea6" text-anchor="middle">305 m · 250 MHz</text>
    <!-- cable leading out -->
    <path d="M1250 720 h120 v40 a40 40 0 0 1 -80 0 v-40" stroke="#3b7fd4" stroke-width="16" fill="none" stroke-linecap="round"/>
  `);
}

/* =========================================================================
   6. SC-SC Single-Mode Fiber Patch Cord (duplex, coiled)
   ========================================================================= */
function fiberPatch() {
  return frame(`
    ${shadow(800, 1230, 480, 70, 30, 0.16)}
    <!-- coiled duplex cable -->
    ${Array.from({length: 30}, (_, i) => {
      const r = 260 + (i % 9) * 22;
      const a0 = (i * 48) * Math.PI / 180;
      const x1 = 800 + r * Math.cos(a0), y1 = 720 + r * Math.sin(a0);
      const x2 = 800 + r * Math.cos(a0 + 0.4), y2 = 720 + r * Math.sin(a0 + 0.4);
      return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#e07b00" stroke-width="14" stroke-linecap="round"/>`;
    }).join('')}
    <!-- SC connectors both ends -->
    <!-- connector A -->
    <g transform="translate(330,470) rotate(-25)">
      <rect x="0" y="0" width="150" height="70" rx="12" fill="url(#pWhite)"/>
      <rect x="0" y="0" width="60" height="70" rx="12" fill="#2b2f38"/>
      <rect x="150" y="14" width="70" height="42" rx="8" fill="#1a2436"/>
      <path d="M216 20 h14 v32 h-14 z" fill="#d9e2ef"/>
      <path d="M230 24 h8 v24 h-8 z" fill="#c8d2e1"/>
    </g>
    <!-- connector B -->
    <g transform="translate(1150,900) rotate(155)">
      <rect x="0" y="0" width="150" height="70" rx="12" fill="url(#pWhite)"/>
      <rect x="0" y="0" width="60" height="70" rx="12" fill="#2b2f38"/>
      <rect x="150" y="14" width="70" height="42" rx="8" fill="#1a2436"/>
      <path d="M216 20 h14 v32 h-14 z" fill="#d9e2ef"/>
      <path d="M230 24 h8 v24 h-8 z" fill="#c8d2e1"/>
    </g>
    <text x="800" y="1180" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="bold" fill="#1c2636" text-anchor="middle">SC-SC · Single-Mode · G.652D · 2 m</text>
  `);
}

/* =========================================================================
   7. Fiber Connector & Adapter Kit (SC/LC assortment in case)
   ========================================================================= */
function fiberKit() {
  const connA = `<g transform="rotate(0)">
    <rect x="-28" y="-40" width="24" height="80" rx="8" fill="#8b98ad"/>
    <rect x="-4" y="-46" width="10" height="92" rx="4" fill="#c4cfdd"/>
    <rect x="6" y="-40" width="22" height="80" rx="8" fill="#0f141c"/>
    <path d="M28 -20 h24 v40 h-24 z" fill="#dfe6f0"/>
  </g>`;
  return frame(`
    ${shadow(800, 1200, 540, 80, 30, 0.16)}
    <!-- open hard case -->
    <path d="M180 1160 L180 560 L1420 560 L1420 1160 Q1420 1200 1380 1200 L220 1200 Q180 1200 180 1160 Z" fill="url(#pDark)"/>
    <path d="M240 1160 L240 620 L1360 620 L1360 1160 Q1360 1190 1330 1190 L270 1190 Q240 1190 240 1160 Z" fill="#0d1219"/>
    <!-- foam inserts -->
    <rect x="320" y="700" width="330" height="260" rx="24" fill="#2a3442"/>
    <rect x="700" y="700" width="330" height="260" rx="24" fill="#2a3442"/>
    <rect x="1080" y="700" width="250" height="260" rx="24" fill="#2a3442"/>

    <!-- SC connectors in foam 1 -->
    ${[0,1,2].map((i) => `<g transform="translate(${400 + i * 120}, 800) rotate(90)">${connA}</g>`).join('')}
    <!-- LC connectors (smaller) in foam 2 -->
    ${[0,1,2].map((i) => `<g transform="translate(${760 + i * 110}, 820) rotate(90) scale(0.7)">${connA}</g>`).join('')}

    <!-- adapters in foam 3 -->
    ${[0,1].map((i) => `<g transform="translate(${1120 + i * 100}, 780)"><rect x="0" y="0" width="70" height="120" rx="14" fill="#5c687a"/><rect x="18" y="20" width="34" height="80" rx="8" fill="#0a0f16"/></g>`).join('')}

    <!-- case text -->
    <text x="320" y="680" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="bold" fill="#dbe3ef" letter-spacing="2">ABS FIBER CONNECTOR KIT</text>
    <text x="320" y="718" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#7f8da3">SC/LC · UPC/APC · Field Termination</text>
  `);
}

/* =========================================================================
   8. 48V PoE Power Adapter (wall-plug injector)
   ========================================================================= */
function poe() {
  return frame(`
    ${shadow(800, 1200, 360, 70, 30, 0.16)}
    <g transform="rotate(-4 800 720)">
      <!-- body -->
      <rect x="480" y="520" width="640" height="460" rx="56" fill="url(#pWhite)"/>
      <path d="M480 580 q320 -80 640 0 l0 40 q-320 -70 -640 0 z" fill="#ffffff" opacity="0.6"/>
      <!-- top band -->
      <rect x="480" y="520" width="640" height="120" rx="56" fill="url(#pBlue)"/>
      <text x="528" y="596" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="bold" fill="#ffffff" letter-spacing="2">ABS PoE</text>
      <text x="528" y="628" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#dbe9ff">48V · 802.3af/at · 30W</text>

      <!-- LEDs -->
      ${led(1030, 600, 16, 'url(#ledGreen)')}
      ${led(1090, 600, 16, 'url(#ledAmber)')}

      <!-- data in / data+power out ports -->
      <text x="528" y="760" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#5b6a80">DATA IN</text>
      ${ethernetPort(528, 776, 150, 84, true)}
      <text x="860" y="760" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#5b6a80">DATA + PoE</text>
      ${ethernetPort(860, 776, 150, 84, true)}

      <!-- power cord -->
      <rect x="780" y="980" width="40" height="300" rx="18" fill="#0e141d"/>
      <path d="M800 1180 q0 60 -60 60" stroke="#0e141d" stroke-width="22" fill="none" stroke-linecap="round"/>
    </g>
  `);
}

function ethernetPort(x, y, w, h, open) {
  const inner = open
    ? `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="3" fill="#0a101a"/>`
    : `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="3" fill="#16202f"/>`;
  let lantern = '';
  for (let i = 0; i < 4; i++) {
    lantern += `<rect x="${x + 6 + i * ((w - 12) / 4)}" y="${y + 6}" width="${(w - 12) / 4 - 4}" height="${h - 12}" rx="2" fill="#0a101a"/>`;
    lantern += `<rect x="${x + 7 + i * ((w - 12) / 4)}" y="${y + 7}" width="${(w - 12) / 4 - 6}" height="${h - 14}" rx="2" fill="#1e2a3c"/>`;
  }
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#pDark)"/>
    ${lantern}
    <rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="#39455a"/>
  </g>`;
}

function sfpPort(x, y, w, h) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#pDark)"/>
    <rect x="${x + 4}" y="${y + (h - 16) / 2}" width="${w - 8}" height="16" rx="4" fill="#24324a"/>
    <rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="#39455a"/>
  </g>`;
}

const renders = {
  'abs-ax3000-wifi-6-router': router,
  'abs-gpon-ont-1ge': ont,
  'abs-24port-gigabit-managed-switch': switch24,
  'abs-ac1200-ceiling-access-point': ap,
  'abs-cat6-utp-lan-cable-305m': cat6,
  'abs-sm-sc-sc-fiber-patch-2m': fiberPatch,
  'abs-fiber-connector-adapter-kit': fiberKit,
  'abs-48v-poe-power-adapter': poe,
};

for (const [slug, fn] of Object.entries(renders)) {
  const svg = fn();
  const out = resolve(OUT, `${slug}.webp`);
  await sharp(Buffer.from(svg))
    .resize(SIZE, SIZE, { fit: 'fill' })
    .webp({ quality: 92 })
    .toFile(out);
  console.log('render OK', slug, '->', out);
}
