import React from "react";
import { Composition } from "remotion";
import { VIDEO, WeihnachtsReel, type ReelProps } from "./WeihnachtsReel";

const standard: ReelProps = { mitMusik: true };

export const RemotionRoot: React.FC = () => (
  <Composition
    id="WeihnachtsReel"
    component={WeihnachtsReel}
    durationInFrames={Math.round(VIDEO.sekunden * VIDEO.fps)}
    fps={VIDEO.fps}
    width={VIDEO.breite}
    height={VIDEO.hoehe}
    defaultProps={standard}
  />
);
