import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BrandIcon, icons } from '../components/BrandIcon';
import { KineticWord, PopIn } from '../components/Motion';
import { OrbitRing } from '../components/Orbit';
import { SceneCanvas, fonts } from '../components/SceneCanvas';
import { brand } from '../theme';

export function OrbitScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const core = spring({
    frame: frame - 4,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  return (
    <SceneCanvas tone="ink">
      <div style={{ position: 'absolute', top: 64, left: 0, right: 0, textAlign: 'center' }}>
        <KineticWord text="REAL STACK" delay={0} size={92} />
        <PopIn delay={20}>
          <div
            style={{
              marginTop: 18,
              fontSize: 34,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            Supabase in the center. Tools in orbit. Nothing mocked.
          </div>
        </PopIn>
      </div>

      <div style={{ position: 'absolute', inset: 0, top: 80 }}>
        <OrbitRing
          icons={[icons.supabase, icons.postgres, icons.drizzle, icons.reactQuery]}
          radius={210}
          size={86}
          speed={0.55}
          delay={10}
        />
        <OrbitRing
          icons={[
            icons.typescript,
            icons.pnpm,
            icons.turborepo,
            icons.zod,
            icons.valibot,
            icons.tanstack,
          ]}
          radius={360}
          size={72}
          speed={0.28}
          delay={18}
          reverse
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 180,
            height: 180,
            marginLeft: -90,
            marginTop: -90,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${brand.sky}, ${brand.blue})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 60px ${brand.blue}aa`,
            opacity: core,
            scale: interpolate(core, [0, 1], [0.4, 1]),
          }}
        >
          <BrandIcon icon={icons.supabase} size={84} />
        </div>
      </div>

      <PopIn
        delay={40}
        style={{
          position: 'absolute',
          bottom: 56,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        {['Auth', 'Postgres + RLS', 'Private Storage', 'Drizzle schema'].map((label) => (
          <div
            key={label}
            style={{
              fontFamily: fonts.mono,
              fontSize: 22,
              fontWeight: 700,
              padding: '12px 20px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.22)',
            }}
          >
            {label}
          </div>
        ))}
      </PopIn>
    </SceneCanvas>
  );
}
