import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BrandIcon, icons, type IconDef } from '../components/BrandIcon';
import { KineticWord, PopIn } from '../components/Motion';
import { SceneCanvas, fonts } from '../components/SceneCanvas';
import { brand } from '../theme';

const nodes: { icon: IconDef; x: number; y: number; delay: number }[] = [
  { icon: icons.pnpm, x: 18, y: 28, delay: 10 },
  { icon: icons.turborepo, x: 42, y: 18, delay: 16 },
  { icon: icons.stim, x: 68, y: 24, delay: 22 },
  { icon: icons.node, x: 84, y: 42, delay: 28 },
  { icon: icons.sentry, x: 72, y: 68, delay: 34 },
  { icon: icons.posthog, x: 46, y: 78, delay: 40 },
  { icon: icons.knip, x: 22, y: 66, delay: 46 },
  { icon: icons.typescript, x: 50, y: 48, delay: 8 },
];

const edges: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 0],
  [7, 0],
  [7, 1],
  [7, 2],
  [7, 4],
  [7, 5],
];

export function QualityScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  return (
    <SceneCanvas tone="blue">
      <div style={{ position: 'absolute', top: 56, left: 80 }}>
        <KineticWord text="DX GRAPH" delay={0} size={86} />
        <PopIn delay={18}>
          <div style={{ marginTop: 14, fontSize: 32, fontWeight: 600, maxWidth: 820 }}>
            Worktrees, Stim, optional Sentry/PostHog (off until configured).
          </div>
        </PopIn>
      </div>

      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {edges.map(([a, b]) => {
          const from = nodes[a]!;
          const to = nodes[b]!;
          return (
            <line
              key={`${a}-${b}`}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={2.5}
              strokeDasharray="8 10"
              strokeDashoffset={interpolate(lineProgress, [0, 1], [120, 0])}
              opacity={interpolate(lineProgress, [0, 1], [0, 0.9])}
            />
          );
        })}
      </svg>

      {nodes.map((node) => {
        const p = spring({
          frame: frame - node.delay,
          fps,
          config: { damping: 12, stiffness: 140 },
        });
        const bob = Math.sin((frame + node.delay) / 14) * 8;
        return (
          <div
            key={node.icon.title}
            style={{
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              translate: `-50% calc(-50% + ${bob}px)`,
              opacity: p,
              scale: interpolate(p, [0, 1], [0.4, 1]),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: node.icon === icons.typescript ? 110 : 92,
                height: node.icon === icons.typescript ? 110 : 92,
                borderRadius: 28,
                background:
                  node.icon === icons.typescript
                    ? brand.white
                    : 'rgba(0,0,0,0.28)',
                border: '2px solid rgba(255,255,255,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
              }}
            >
              <BrandIcon
                icon={node.icon}
                size={node.icon === icons.typescript ? 58 : 48}
                tint={node.icon.invert ? '#fff' : undefined}
              />
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 18,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.88)',
              }}
            >
              {node.icon.title}
            </div>
          </div>
        );
      })}

      <PopIn
        delay={55}
        style={{
          position: 'absolute',
          bottom: 48,
          right: 72,
          fontFamily: fonts.mono,
          fontSize: 26,
          fontWeight: 700,
          background: brand.ink,
          color: brand.white,
          padding: '16px 26px',
          borderRadius: 14,
          whiteSpace: 'nowrap',
        }}
      >
        pnpm worktree APP-123
      </PopIn>
    </SceneCanvas>
  );
}
