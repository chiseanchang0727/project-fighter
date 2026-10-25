import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Polyline, Rect } from "react-native-svg";
import type { Theme } from "../theme";

interface Point { date: string; value: number }

const HEIGHT = 120;
const PAD = 12;

export function TrendChart({
  points, refLow, refHigh, theme,
}: { points: Point[]; refLow?: number; refHigh?: number; theme: Theme }) {
  const [width, setWidth] = useState(0);
  if (points.length === 0) return null;

  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const all = [
    ...sorted.map((p) => p.value),
    ...(refLow !== undefined ? [refLow] : []),
    ...(refHigh !== undefined ? [refHigh] : []),
  ];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;

  const x = (i: number) => (sorted.length === 1 ? width / 2 : PAD + (i * (width - 2 * PAD)) / (sorted.length - 1));
  const y = (v: number) => HEIGHT - PAD - ((v - min) / span) * (HEIGHT - 2 * PAD);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          {refLow !== undefined && refHigh !== undefined && (
            <Rect x={0} y={y(refHigh)} width={width} height={Math.max(0, y(refLow) - y(refHigh))} fill={theme.band} />
          )}
          {sorted.length > 1 && (
            <Polyline
              points={sorted.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")}
              fill="none" stroke={theme.accent} strokeWidth={2}
            />
          )}
          {sorted.map((p, i) => (
            <Circle key={p.date} cx={x(i)} cy={y(p.value)} r={4} fill={theme.accent} />
          ))}
        </Svg>
      )}
    </View>
  );
}
