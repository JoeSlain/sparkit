import type { CSSProperties } from 'react';
import {
  siAndroid,
  siApple,
  siDrizzle,
  siExpo,
  siKnip,
  siNodedotjs,
  siPnpm,
  siPostgresql,
  siPosthog,
  siReact,
  siReactquery,
  siReactrouter,
  siSentry,
  siSupabase,
  siTanstack,
  siTurborepo,
  siTypescript,
  siVite,
  siVitest,
  siZod,
  type SimpleIcon,
} from 'simple-icons';

export type IconDef = {
  title: string;
  hex: string;
  path: string;
  invert?: boolean;
};

function fromSimple(icon: SimpleIcon, invert = false): IconDef {
  return { title: icon.title, hex: `#${icon.hex}`, path: icon.path, invert };
}

/** Official Simple Icons where available; custom paths for the rest. */
export const icons = {
  expo: fromSimple(siExpo, true),
  react: fromSimple(siReact),
  vite: fromSimple(siVite),
  reactRouter: fromSimple(siReactrouter),
  typescript: fromSimple(siTypescript),
  supabase: fromSimple(siSupabase),
  postgres: fromSimple(siPostgresql),
  drizzle: fromSimple(siDrizzle),
  tanstack: fromSimple(siTanstack),
  reactQuery: fromSimple(siReactquery),
  pnpm: fromSimple(siPnpm),
  vitest: fromSimple(siVitest),
  apple: fromSimple(siApple, true),
  android: fromSimple(siAndroid),
  node: fromSimple(siNodedotjs),
  turborepo: fromSimple(siTurborepo),
  knip: fromSimple(siKnip),
  sentry: fromSimple(siSentry),
  posthog: fromSimple(siPosthog),
  zod: fromSimple(siZod),
  playwright: {
    title: 'Playwright',
    hex: '#2EAD33',
    path: 'M23.2 12.3c0-.2-.1-.4-.2-.5L13.3.4c-.3-.4-.9-.4-1.2 0L1.4 11.8c-.1.1-.2.3-.2.5v.2c0 .2.1.4.2.5l10.7 11.4c.3.4.9.4 1.2 0L23 13c.1-.1.2-.3.2-.5v-.2zm-11 9.1L3.5 12.5 12.2 3l8.7 9.5-8.7 8.9zM8.6 11.2l3.2-3.4 1.1 1.2-3.2 3.4-1.1-1.2zm6.9 0l-1.1 1.2-3.2-3.4 1.1-1.2 3.2 3.4z',
  },
  tamagui: {
    title: 'Tamagui',
    hex: '#FFF',
    path: 'M12 2c-2.4 3.4-4 6.2-4 9a4 4 0 1 0 8 0c0-2.8-1.6-5.6-4-9zm0 18.5c-1.4 0-2.6-.5-3.5-1.3.8.2 1.7.3 2.5.3.9 0 1.8-.1 2.6-.4-.9.9-2.1 1.4-3.6 1.4z',
    invert: false,
  },
  lingui: {
    title: 'Lingui',
    hex: '#00AD9B',
    path: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 0 1 7.5 5.2H15a14 14 0 0 0-3-4.7A8 8 0 0 1 12 4zm-1.2.7A12 12 0 0 1 13.7 9H9.1a12 12 0 0 1 1.7-4.3zM4.5 9A8 8 0 0 1 12 4c.4 0 .8 0 1.2.1A14 14 0 0 0 9 9H4.5zm0 2H9a14 14 0 0 0 0 2H4.5A8 8 0 0 1 4.5 11zm.3 4H9a14 14 0 0 0 1.8 4.3A8 8 0 0 1 4.8 15zM12 20a8 8 0 0 1-1.2-.1A14 14 0 0 0 15 15h4.5A8 8 0 0 1 12 20zm3-5a14 14 0 0 0 0-2h4.5a8 8 0 0 1 0 2H15zm1.9-4h4.6A8 8 0 0 0 12 4.1c1.1 1.4 2 3 2.5 4.9h2.4z',
  },
  maestro: {
    title: 'Maestro',
    hex: '#F26D50',
    path: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm1 3v10h8V6H8zm2.2 12h3.6v1h-3.6v-1zm1.3-8.2 2.8 2.8-1.1 1.1-1.7-1.7-1-1 1-1.2z',
  },
  stim: {
    title: 'Stim',
    hex: '#FFD43B',
    path: 'M13 2 4 14h7l-1 8 10-14h-7l0-6z',
  },
  valibot: {
    title: 'Valibot',
    hex: '#FFD43A',
    path: 'M12 2 3 7v10l9 5 9-5V7L12 2zm0 2.3 6.5 3.6v7.2L12 19.7l-6.5-3.6V7.9L12 4.3zm0 3.2-3.5 6h2.1l1.4-2.5 1.4 2.5H15.5L12 7.5z',
  },
} as const;

type BrandIconProps = {
  icon: IconDef;
  size?: number;
  style?: CSSProperties;
  tint?: string;
};

export function BrandIcon({ icon, size = 72, style, tint }: BrandIconProps) {
  const fill = tint ?? (icon.invert ? '#FFFFFF' : icon.hex);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={icon.title}
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <title>{icon.title}</title>
      <path d={icon.path} fill={fill} />
    </svg>
  );
}

type IconBadgeProps = {
  icon: IconDef;
  size?: number;
  label?: boolean;
  style?: CSSProperties;
};

export function IconBadge({ icon, size = 96, label = true, style }: IconBadgeProps) {
  const pad = size * 0.22;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        ...style,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: icon.invert ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.14)',
          border: '1.5px solid rgba(255,255,255,0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <BrandIcon icon={icon} size={size - pad * 2} />
      </div>
      {label ? (
        <div
          style={{
            fontSize: Math.max(18, size * 0.22),
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: 0.3,
          }}
        >
          {icon.title}
        </div>
      ) : null}
    </div>
  );
}
