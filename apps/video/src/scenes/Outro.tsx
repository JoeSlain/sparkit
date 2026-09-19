import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { icons } from '../components/BrandIcon';
import { KineticWord, PopIn } from '../components/Motion';
import { IconRain } from '../components/Orbit';
import { SceneCanvas, fonts } from '../components/SceneCanvas';
import { brand } from '../theme';

export function OutroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const smash = spring({
    frame: frame - 4,
    fps,
    config: { damping: 11, stiffness: 130 },
  });

  return (
    <SceneCanvas tone="blue">
      <IconRain
        icons={[
          icons.expo,
          icons.supabase,
          icons.vite,
          icons.react,
          icons.vitest,
          icons.playwright,
          icons.pnpm,
          icons.typescript,
        ]}
        count={22}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          zIndex: 1,
        }}
      >
        <div
          style={{
            opacity: smash,
            scale: interpolate(smash, [0, 1], [0.7, 1]),
          }}
        >
          <Img src={staticFile('banner.png')} style={{ width: 640, borderRadius: 28 }} />
        </div>
        <KineticWord text="CLONE." delay={12} size={96} />
        <KineticWord text="CONFIGURE." delay={22} size={96} />
        <KineticWord text="SHIP." delay={32} size={96} color={brand.amber} />
        <PopIn delay={48} from="scale">
          <code
            style={{
              fontFamily: fonts.mono,
              fontSize: 32,
              fontWeight: 700,
              color: brand.ink,
              background: brand.white,
              padding: '20px 34px',
              borderRadius: 16,
              boxShadow: '0 20px 50px rgba(4,46,122,0.35)',
            }}
          >
            pnpm create:project ../my-app --targets both
          </code>
        </PopIn>
        <PopIn delay={58}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>
            Open source · MIT · real data, no theater
          </div>
        </PopIn>
      </div>
    </SceneCanvas>
  );
}
