import { Composition } from 'remotion';
import { SparkitPromo, calculatePromoDuration } from './SparkitPromo';
import { VIDEO } from './theme';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="SparkitPromo"
        component={SparkitPromo}
        durationInFrames={calculatePromoDuration()}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
