import type { AutoTileConfig } from "$lib/utils/canvas/rpgmaker/types";
import type { Position } from "$lib/utils/canvas/types";
import createAutoTileConfig from "$lib/utils/map/createAutoTileConfig";
import createMap, {
  createLayer as createMapLayer,
} from "$lib/utils/map/createMap";
import type {
  ForgeMap,
  TileName,
  TileWithConfig,
  TileWithNeighbors,
} from "$lib/utils/map/types";
import { cloneDeep } from "lodash";
import { get, writable } from "svelte/store";

const mapStore = writable<ForgeMap>(createMap(25, 15));

function createLayer() {
  mapStore.update((state) => {
    const map = cloneDeep(state);
    createMapLayer(map, `Layer ${map.layers.length + 1}`);
    return map;
  });
}

function removeLayer(index: number) {
  mapStore.update((state) => {
    const map = cloneDeep(state);
    map.layers.splice(index, 1);
    return map;
  });
}

function renameLayer(index: number, name: string) {
  mapStore.update((state) => {
    const map = cloneDeep(state);
    map.layers[index].label = name;
    return map;
  });
}

function draw(layer: number, position: Position, tiles: string[]) {
  mapStore.update((state) => {
    const map = cloneDeep(state);
    map.layers[layer].tiles[position.y][position.x] = tiles[0];
    return map;
  });
}

function remove(layer: number, position: Position) {
  mapStore.update((state) => {
    const map = cloneDeep(state);
    map.layers[layer].tiles[position.y][position.x] = null;
    return map;
  });
}

function getTile(layer: number, position: Position): TileName {
  return get(mapStore).layers[layer].tiles[position.y][position.x];
}

function getTileWithConfig(
  layer: number,
  position: Position
): TileWithConfig | null {
  const tiles = get(mapStore).layers[layer].tiles;
  const { x, y } = position;
  const key = tiles[y][x];
  if (!key) {
    return null;
  }
  return {
    key,
    config: createTileConfig(x, y, layer),
  };
}

function createTileConfig(
  x: number,
  y: number,
  layer: number,
  centerTile?: TileName
): AutoTileConfig {
  const tiles = get(mapStore).layers[layer].tiles;
  const context = createTileContext(tiles, x, y, centerTile);
  return createAutoTileConfig(context);
}

function createTileContext(
  tiles: TileName[][],
  x: number,
  y: number,
  centerTile?: TileName
): TileWithNeighbors {
  return {
    topLeft: getTileKey(tiles, x - 1, y - 1),
    top: getTileKey(tiles, x, y - 1),
    topRight: getTileKey(tiles, x + 1, y - 1),
    left: getTileKey(tiles, x - 1, y),
    center: centerTile ?? getTileKey(tiles, x, y),
    right: getTileKey(tiles, x + 1, y),
    bottomLeft: getTileKey(tiles, x - 1, y + 1),
    bottom: getTileKey(tiles, x, y + 1),
    bottomRight: getTileKey(tiles, x + 1, y + 1),
  };
}

function getTileKey(tiles: TileName[][], x: number, y: number): TileName {
  if (y >= 0 && x >= 0 && y < tiles.length && x < tiles[y].length) {
    return tiles[y][x];
  }
  return null;
}

function fill(layer: number, position: Position, tiles: string[]) {
  mapStore.update((state) => {
    const map = cloneDeep(state);
    const currentTile = getTileKey(
      map.layers[layer].tiles,
      position.x,
      position.y
    );
    floodFill(
      map.layers[layer].tiles,
      position.x,
      position.y,
      tiles[0],
      currentTile
    );
    return map;
  });
}

function floodFill(
  grid: TileName[][],
  x: number,
  y: number,
  fillValue: TileName,
  targetValue: TileName
) {
  // Checke, ob die Koordinaten innerhalb des Gitters liegen.
  if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
    return;
  }

  // Wenn das aktuelle Feld nicht `null` ist, breche ab.
  if (grid[y][x] !== targetValue) {
    return;
  }

  // Fülle das aktuelle Feld mit dem angegebenen Wert.
  grid[y][x] = fillValue;

  // Rekursiver Aufruf für die vier benachbarten Felder (oben, unten, links, rechts).
  floodFill(grid, x + 1, y, fillValue, targetValue); // rechts
  floodFill(grid, x - 1, y, fillValue, targetValue); // links
  floodFill(grid, x, y + 1, fillValue, targetValue); // unten
  floodFill(grid, x, y - 1, fillValue, targetValue); // oben
}

function printDebug() {
  const map = get(mapStore);
  const debugInfo = map.layers.map((layer, index) =>
    layer.tiles.map((col, y) =>
      col.map((cell, x) => createTileContext(layer.tiles, x, y))
    )
  );
  console.info(debugInfo);
}

const map = {
  subscribe: mapStore.subscribe,
  update: mapStore.update,
  set: mapStore.set,
  createLayer,
  removeLayer,
  renameLayer,
  draw,
  remove,
  getTile,
  getTileWithConfig,
  createTileConfig,
  fill,
  printDebug,
};

export default map;
