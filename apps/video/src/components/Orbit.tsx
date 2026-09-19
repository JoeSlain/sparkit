import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BrandIcon, type IconDef } from './BrandIcon';
import { fonts } from './SceneCanvas';

type OrbitRingProps = {
  icons: IconDef[];
  radius: number;
  size?: number;
  speed?: number;
  delay?: number;
  reverse?: boolean;
  showLabels?: boolean;
};

export function OrbitRing({
  icons,
  radius,
  size = 78,
  speed = 0.35,
  delay = 0,
  reverse = false,
  showLabels = false,
}: OrbitRingProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const spin = (reverse ? -1 : 1) * frame * speed;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
        borderRadius: '50%',
        border: '1.5px dashed rgba(255,255,255,0.18)',
        opacity: enter,
        scale: interpolate(enter, [0, 1], [0.7, 1]),
      }}
    >
      {icons.map((icon, index) => {
        const angle = (360 / icons.length) * index + spin;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        return (
          <div
            key={`${icon.title}-${index}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              translate: `${x}px ${y}px`,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              width: size,
              height: size,
              borderRadius: size * 0.28,
              background: icon.invert ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.28)',
            }}
          >
            <BrandIcon icon={icon} size={size * 0.52} />
            {showLabels ? (
              <div
                style={{
                  position: 'absolute',
                  top: size + 8,
                  left: '50%',
                  translate: '-50% 0',
                  fontFamily: fonts.display,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.75)',
                  whiteSpace: 'nowrap',
                }}
              >
                {icon.title}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type IconRainProps = {
  icons: IconDef[];
  count?: number;
};

export function IconRain({ icons, count = 18 }: IconRainProps) {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: count }, (_, index) => {
        const icon = icons[index % icons.length]!;
        const x = (index * 97) % 100;
        const speed = 2.2 + (index % 5) * 0.35;
        const y = ((frame * speed + index * 70) % 130) - 20;
        const rot = frame * (0.8 + (index % 4) * 0.3) * (index % 2 === 0 ? 1 : -1);
        const opacity = interpolate(y, [-20, 10, 100, 120], [0, 0.85, 0.85, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              opacity,
              rotate: `${rot}deg`,
              scale: 0.55 + (index % 4) * 0.12,
            }}
          >
            <BrandIcon icon={icon} size={48} />
          </div>
        );
      })}
    </div>
  );
}
