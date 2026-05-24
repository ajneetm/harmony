import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const fontBold = readFileSync(join(rootDir, 'public/ArbFONTS-Montserrat-Arabic-Bold.ttf'))
const fontRegular = readFileSync(join(rootDir, 'public/ArbFONTS-Montserrat-Arabic-Regular.ttf'))

function h(type, props, ...children) {
  const flat = children.flat().filter(c => c != null)
  return { type, props: { ...props, children: flat.length === 1 ? flat[0] : flat.length ? flat : undefined } }
}

const element = h('div', {
  style: {
    background: '#000000',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Montserrat',
  },
},
  // Background glow top-right
  h('div', { style: { position: 'absolute', top: -120, right: -120, width: 420, height: 420, borderRadius: '50%', background: 'rgba(220,38,38,0.12)', display: 'flex' } }),
  // Background glow bottom-left
  h('div', { style: { position: 'absolute', bottom: -80, left: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(220,38,38,0.07)', display: 'flex' } }),

  // Hexagonal logo mark
  h('svg', { width: 96, height: 96, viewBox: '0 0 96 96' },
    h('polygon', { points: '48,4 88,26 88,70 48,92 8,70 8,26', fill: 'none', stroke: '#dc2626', strokeWidth: '3' }),
    h('polygon', { points: '48,18 74,33 74,63 48,78 22,63 22,33', fill: 'rgba(220,38,38,0.18)', stroke: 'none' }),
  ),

  // Brand name
  h('div', { style: { color: 'white', fontSize: 96, fontWeight: 700, letterSpacing: '-3px', lineHeight: 1, marginTop: 22 } }, 'Harmony'),

  // Tagline
  h('div', { style: { color: 'rgba(255,255,255,0.55)', fontSize: 24, marginTop: 16 } }, 'AI-Powered Assessment Platform'),

  // Domain
  h('div', { style: { color: 'rgba(255,255,255,0.3)', fontSize: 17, marginTop: 10 } }, 'harmonymold.com'),

  // Red bottom bar
  h('div', { style: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 7, background: '#dc2626', display: 'flex' } }),
)

const svg = await satori(element, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Montserrat', data: fontBold, weight: 700, style: 'normal' },
    { name: 'Montserrat', data: fontRegular, weight: 400, style: 'normal' },
  ],
})

const resvg = new Resvg(svg)
const pngData = resvg.render()
writeFileSync(join(rootDir, 'public/og-image.png'), pngData.asPng())
console.log('✓ OG image generated → public/og-image.png')
