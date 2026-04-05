import * as React from 'react'
import logoUrl from './misbara_full_logo.svg'

export const BrandLogo = (
  props: React.ImgHTMLAttributes<HTMLImageElement>
) => (
  <button
    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    onClick={() => { if ((window as any).navigateTo) (window as any).navigateTo('/') }}
  >
    <img src={logoUrl} alt="Misbara logo" width={50} {...props} />
  </button>
)
