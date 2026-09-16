import { AbsoluteFill } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { IntroScene } from './scenes/Intro';
import { PlatformsScene } from './scenes/Platforms';
import { OrbitScene } from './scenes/Orbit';
import { ProofScene } from './scenes/Proof';
import { I18nScene } from './scenes/I18n';
import { QualityScene } from './scenes/Quality';
import { OutroScene } from './scenes/Outro';
import { sceneFrames, transitionFrames } from './theme';

const fadeTiming = linearTiming({ durationInFrames: transitionFrames });

export function SparkitPromo() {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={sceneFrames.intro} name="Intro">
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-left' })}
          timing={fadeTiming}
        />

        <TransitionSeries.Sequence durationInFrames={sceneFrames.platforms} name="Platforms">
          <PlatformsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={fadeTiming}
        />

        <TransitionSeries.Sequence durationInFrames={sceneFrames.orbit} name="Orbit">
          <OrbitScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneFrames.proof} name="Proof">
          <ProofScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-top' })}
          timing={fadeTiming}
        />

        <TransitionSeries.Sequence durationInFrames={sceneFrames.i18n} name="I18n">
          <I18nScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-left' })}
          timing={fadeTiming}
        />

        <TransitionSeries.Sequence durationInFrames={sceneFrames.quality} name="DX">
          <QualityScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-right' })}
          timing={fadeTiming}
        />

        <TransitionSeries.Sequence durationInFrames={sceneFrames.outro} name="Outro">
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}

export function calculatePromoDuration() {
  const scenes = Object.values(sceneFrames);
  const sceneTotal = scenes.reduce((sum, value) => sum + value, 0);
  const transitions = (scenes.length - 1) * transitionFrames;
  return sceneTotal - transitions;
}
