import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BrandIcon, icons, type IconDef } from '../components/BrandIcon';
import { PopIn, TypeLine } from '../components/Motion';
import { SceneCanvas, fonts } from '../components/SceneCanvas';
import { brand } from '../theme';

const checks: { icon: IconDef; label: string; at: number }[] = [
  { icon: icons.vitest, label: 'unit + component', at: 48 },
  { icon: icons.postgres, label: 'pgTAP isolation', at: 60 },
  { icon: icons.playwright, label: 'web e2e', at: 72 },
  { icon: icons.maestro, label: 'device flow', at: 84 },
  { icon: icons.supabase, label: 'live integration', at: 96 },
  { icon: icons.knip, label: 'dead code', at: 108 },
];

export function ProofScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneCanvas tone="terminal">
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 80,
          width: 1020,
          borderRadius: 24,
          background: 'rgba(0,0,0,0.55)',
          border: '1.5px solid rgba(124,255,178,0.25)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          padding: '28px 32px',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
          <div
            style={{
              marginLeft: 12,
              fontFamily: fonts.mono,
              fontSize: 18,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            sparkit — verify
          </div>
        </div>
        <TypeLine text="$ pnpm verify" start={6} cps={22} color="#7CFFB2" />
        <div style={{ height: 14 }} />
        <TypeLine text="✓ lingui compile" start={28} cps={40} color="#A8FFCF" cursor={false} />
        <TypeLine
          text="✓ oxlint · oxfmt · tsc"
          start={38}
          cps={40}
          color="#A8FFCF"
          cursor={false}
        />
        <TypeLine
          text="✓ vitest · package builds"
          start={48}
          cps={40}
          color="#A8FFCF"
          cursor={false}
        />
        <TypeLine
          text="→ next: integration · db:test · e2e"
          start={62}
          cps={32}
          color={brand.amber}
          cursor={false}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 620,
        }}
      >
        {checks.map((item) => {
          const p = spring({
            frame: frame - item.at,
            fps,
            config: { damping: 12, stiffness: 150 },
          });
          return (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '16px 20px',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                opacity: p,
                translate: `${interpolate(p, [0, 1], [80, 0])}px 0px`,
                scale: interpolate(p, [0, 1], [0.9, 1]),
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BrandIcon icon={item.icon} size={34} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 28 }}>
                  {item.icon.title}
                </div>
                <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.65)' }}>{item.label}</div>
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontWeight: 700,
                  color: brand.mint,
                  fontSize: 28,
                  opacity: p,
                }}
              >
                PASS
              </div>
            </div>
          );
        })}
      </div>

      <PopIn delay={120} style={{ position: 'absolute', bottom: 48, left: 90 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
          Acceptance never greenlights a lying mock.
        </div>
      </PopIn>
    </SceneCanvas>
  );
}
