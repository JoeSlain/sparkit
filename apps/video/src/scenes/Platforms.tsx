import type { ReactNode } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BrandIcon, icons } from '../components/BrandIcon';
import { KineticWord, PopIn } from '../components/Motion';
import { SceneCanvas, fonts } from '../components/SceneCanvas';
import { brand } from '../theme';

function DeviceFrame({
  kind,
  delay,
  children,
}: {
  kind: 'phone' | 'browser';
  delay: number;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  if (kind === 'phone') {
    return (
      <div
        style={{
          width: 320,
          height: 620,
          borderRadius: 42,
          background: '#0A0F1A',
          border: '3px solid rgba(255,255,255,0.35)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
          padding: 18,
          opacity: p,
          translate: `${interpolate(p, [0, 1], [-120, 0])}px 0px`,
          rotate: `${interpolate(p, [0, 1], [-10, -3])}deg`,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div
          style={{
            height: 18,
            width: 110,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.15)',
            alignSelf: 'center',
          }}
        />
        <div
          style={{
            flex: 1,
            borderRadius: 28,
            backgroundImage: `linear-gradient(160deg, ${brand.blueDeep}, ${brand.blue})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            padding: 24,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 560,
        height: 380,
        borderRadius: 22,
        background: '#101826',
        border: '2px solid rgba(255,255,255,0.28)',
        boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        opacity: p,
        translate: `${interpolate(p, [0, 1], [120, 0])}px 0px`,
        rotate: `${interpolate(p, [0, 1], [10, 3])}deg`,
      }}
    >
      <div
        style={{
          height: 44,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 16px',
        }}
      >
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
        ))}
        <div
          style={{
            marginLeft: 12,
            flex: 1,
            height: 22,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.1)',
            fontFamily: fonts.mono,
            fontSize: 14,
            color: 'rgba(255,255,255,0.65)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
          }}
        >
          localhost:5173
        </div>
      </div>
      <div
        style={{
          height: 'calc(100% - 44px)',
          background: `linear-gradient(145deg, ${brand.blue}, ${brand.violet})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          padding: 28,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PlatformsScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bridge = spring({
    frame: frame - 28,
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  return (
    <SceneCanvas tone="ink">
      <div style={{ position: 'absolute', top: 72, left: 96 }}>
        <KineticWord text="NATIVE" delay={0} size={86} color={brand.sky} />
        <div style={{ height: 8 }} />
        <KineticWord text="+ WEB" delay={8} size={86} />
      </div>
      <PopIn delay={18} style={{ position: 'absolute', top: 280, left: 96, maxWidth: 520 }}>
        <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.35, color: 'rgba(255,255,255,0.82)' }}>
          Expo Router on device. React Router + Vite in the browser. Tamagui 2 on both. No Expo Web.
        </div>
      </PopIn>

      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 120,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <DeviceFrame kind="phone" delay={12}>
          <BrandIcon icon={icons.expo} size={64} tint="#fff" />
          <div style={{ display: 'flex', gap: 18 }}>
            <BrandIcon icon={icons.apple} size={40} tint="#fff" />
            <BrandIcon icon={icons.android} size={40} />
          </div>
          <BrandIcon icon={icons.stim} size={42} />
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 22 }}>iOS · Android</div>
        </DeviceFrame>

        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 28,
            background: brand.coral,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: bridge,
            scale: interpolate(bridge, [0, 1], [0.4, 1]),
            boxShadow: '0 0 40px rgba(255,107,74,0.55)',
            zIndex: 2,
          }}
        >
          <BrandIcon icon={icons.tamagui} size={48} tint="#fff" />
        </div>

        <DeviceFrame kind="browser" delay={20}>
          <BrandIcon icon={icons.vite} size={64} />
          <BrandIcon icon={icons.reactRouter} size={64} />
          <BrandIcon icon={icons.react} size={64} />
        </DeviceFrame>
      </div>
    </SceneCanvas>
  );
}
