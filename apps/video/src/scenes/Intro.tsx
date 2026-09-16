import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { icons } from '../components/BrandIcon';
import { KineticWord, PopIn } from '../components/Motion';
import { IconRain } from '../components/Orbit';
import { SceneCanvas, fonts } from '../components/SceneCanvas';
import { brand } from '../theme';

export function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const smash = spring({
    frame: frame - 6,
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.65 },
  });
  const pulse = 1 + Math.sin(frame / 12) * 0.02;

  return (
    <SceneCanvas tone="blue">
      <IconRain
        icons={[icons.react, icons.expo, icons.supabase, icons.vite, icons.typescript, icons.pnpm]}
        count={16}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        <div
          style={{
            opacity: smash,
            scale: interpolate(smash, [0, 1], [0.55, 1]) * pulse,
            rotate: `${interpolate(smash, [0, 1], [-8, 0])}deg`,
          }}
        >
          <Img
            src={staticFile('banner.png')}
            style={{
              width: 860,
              borderRadius: 32,
              boxShadow: '0 28px 80px rgba(4,46,122,0.45)',
            }}
          />
        </div>
        <KineticWord text="IGNITE" delay={18} size={118} />
        <PopIn delay={42} from="up">
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: 40,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              maxWidth: 1100,
            }}
          >
            TypeScript starter for native iOS, Android, and web
          </div>
        </PopIn>
        <PopIn delay={54} from="scale">
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 26,
              fontWeight: 700,
              color: brand.ink,
              background: brand.white,
              padding: '14px 28px',
              borderRadius: 14,
            }}
          >
            real auth · real data · zero mock theater
          </div>
        </PopIn>
      </div>
    </SceneCanvas>
  );
}
