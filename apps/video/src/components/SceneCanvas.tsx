import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadJetBrains } from '@remotion/google-fonts/JetBrainsMono';
import { brand } from '../theme';

const { fontFamily: display } = loadFont('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin'],
});

const { fontFamily: mono } = loadJetBrains('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
});

export const fonts = { display, mono };

type SceneCanvasProps = {
  children: ReactNode;
  tone?: 'ink' | 'blue' | 'cream' | 'terminal';
};

const tones = {
  ink: { base: brand.ink, a: 'rgba(11,108,255,0.45)', b: 'rgba(124,92,255,0.28)', c: 'rgba(255,107,74,0.18)' },
  blue: { base: brand.blue, a: 'rgba(126,196,255,0.5)', b: 'rgba(4,46,122,0.55)', c: 'rgba(255,255,255,0.2)' },
  cream: { base: brand.cream, a: 'rgba(11,108,255,0.16)', b: 'rgba(31,169,122,0.12)', c: 'rgba(245,185,66,0.18)' },
  terminal: { base: '#06110C', a: 'rgba(31,169,122,0.35)', b: 'rgba(11,108,255,0.2)', c: 'rgba(245,185,66,0.12)' },
} as const;

export function SceneCanvas({ children, tone = 'ink' }: SceneCanvasProps) {
  const frame = useCurrentFrame();
  const t = tones[tone];
  const drift = interpolate(frame, [0, 240], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: t.base, overflow: 'hidden', fontFamily: display }}>
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${t.a} 0%, transparent 68%)`,
          top: -220 + drift * 50,
          left: -180,
          filter: 'blur(4px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${t.b} 0%, transparent 70%)`,
          bottom: -360,
          right: -260 - drift * 40,
          filter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${t.c} 0%, transparent 72%)`,
          top: 220,
          right: 320,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: tone === 'cream' ? 0.35 : 0.25,
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 85%)',
        }}
      />
      <AbsoluteFill style={{ color: tone === 'cream' ? brand.ink : brand.white }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
