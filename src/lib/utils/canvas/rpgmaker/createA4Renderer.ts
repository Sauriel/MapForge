import SimpleAutoTileRenderer from "./SimpleAutoTileRenderer";
import SimpleSemiAutoTileRenderer from "./SimpleSemiAutoTileRenderer";
import { createAutoTiles } from "./TileRenderer";
import type { TilePositions, TileRendererConfig, TileSource } from "./types";

export default function createA4Renderer(
  source: TileSource
): TileRendererConfig[] {
  const positions: TilePositions = {
    0: [0, 96, 192, 288, 384, 480, 576, 672],
    144: [0, 96, 192, 288, 384, 480, 576, 672],
    240: [0, 96, 192, 288, 384, 480, 576, 672],
    384: [0, 96, 192, 288, 384, 480, 576, 672],
    480: [0, 96, 192, 288, 384, 480, 576, 672],
    624: [0, 96, 192, 288, 384, 480, 576, 672],
  };
  return createAutoTiles("A4", source, positions, (source, x, y, tileSize) => {
    if (y % 10 === 0) {
      return new SimpleAutoTileRenderer(source, x, y, tileSize);
    } else {
      return new SimpleSemiAutoTileRenderer(source, x, y, tileSize);
    }
  });
}
