import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BrandIcon, icons } from '../components/BrandIcon';
import { KineticWord, PopIn } from '../components/Motion';
import { SceneCanvas, fonts } from '../components/SceneCanvas';
import { brand } from '../theme';

export function I18nScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flip = spring({
    frame: frame - 28,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  return (
    <SceneCanvas tone="cream">
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 96,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 24,
            background: brand.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BrandIcon icon={icons.lingui} size={48} />
        </div>
        <KineticWord text="LINGUI" delay={0} size={88} color={brand.ink} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          translate: '-50% -50%',
          perspective: 1200,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 168,
            fontWeight: 700,
            color: brand.ink,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${interpolate(flip, [0, 1], [0, 180])}deg)`,
            position: 'relative',
            width: 900,
            height: 200,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Hello
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              color: brand.blue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Bonjour
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 90,
          left: 96,
          right: 96,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <PopIn delay={16} from="left">
          <div style={{ fontSize: 36, fontWeight: 700, maxWidth: 700, lineHeight: 1.3 }}>
            English is the source. French catalogs ship with the starter.
          </div>
        </PopIn>
        <PopIn delay={28} from="right">
          <div style={{ display: 'flex', gap: 14 }}>
            {['EN', 'FR', 'i18n:check'].map((tag, index) => (
              <div
                key={tag}
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 26,
                  fontWeight: 700,
                  padding: '14px 22px',
                  borderRadius: 14,
                  background: index === 2 ? brand.blue : brand.ink,
                  color: brand.white,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </PopIn>
      </div>
    </SceneCanvas>
  );
}
