import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CSSProperties, ReactNode } from 'react';
import { fonts } from './SceneCanvas';

type PopInProps = {
  children: ReactNode;
  delay?: number;
  from?: 'up' | 'down' | 'left' | 'right' | 'scale';
  style?: CSSProperties;
};

export function PopIn({ children, delay = 0, from = 'up', style }: PopInProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.7 },
  });

  const map = {
    up: { x: 0, y: 56 },
    down: { x: 0, y: -56 },
    left: { x: 72, y: 0 },
    right: { x: -72, y: 0 },
    scale: { x: 0, y: 0 },
  }[from];

  return (
    <div
      style={{
        opacity: p,
        translate: `${interpolate(p, [0, 1], [map.x, 0])}px ${interpolate(p, [0, 1], [map.y, 0])}px`,
        scale:
          from === 'scale' ? interpolate(p, [0, 1], [0.55, 1]) : interpolate(p, [0, 1], [0.88, 1]),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type KineticWordProps = {
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  stagger?: number;
};

export function KineticWord({
  text,
  delay = 0,
  size = 120,
  color = '#fff',
  stagger = 2,
}: KineticWordProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = [...text];

  return (
    <div style={{ display: 'flex', gap: size * 0.02 }}>
      {letters.map((letter, index) => {
        const p = spring({
          frame: frame - delay - index * stagger,
          fps,
          config: { damping: 12, stiffness: 160, mass: 0.55 },
        });
        return (
          <span
            key={`${letter}-${index}`}
            style={{
              fontFamily: fonts.display,
              fontSize: size,
              fontWeight: 700,
              lineHeight: 1,
              color,
              display: 'inline-block',
              opacity: p,
              translate: `0px ${interpolate(p, [0, 1], [80, 0])}px`,
              rotate: `${interpolate(p, [0, 1], [-12, 0])}deg`,
              scale: interpolate(p, [0, 1], [0.6, 1]),
              whiteSpace: 'pre',
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
}

type TypeLineProps = {
  text: string;
  start?: number;
  cps?: number;
  color?: string;
  cursor?: boolean;
};

export function TypeLine({
  text,
  start = 0,
  cps = 28,
  color = '#7CFFB2',
  cursor = true,
}: TypeLineProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Math.max(0, Math.floor(((frame - start) / fps) * cps));
  const shown = text.slice(0, chars);
  const blink = Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 34,
        fontWeight: 500,
        color,
        whiteSpace: 'pre',
      }}
    >
      {shown}
      {cursor && chars < text.length ? (
        <span style={{ opacity: blink ? 1 : 0 }}>▌</span>
      ) : cursor && blink ? (
        <span>▌</span>
      ) : null}
    </div>
  );
}
