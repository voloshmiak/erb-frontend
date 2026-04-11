import type { RailwayGraph } from '@/5_entities/station/model/type';

/**
 * Finds the shortest path of station IDs between source and destination using BFS.
 * Returns an array of station IDs [sourceId, ..., destinationId].
 */
export const findShortestPath = (
  graph: RailwayGraph | null,
  sourceId: string,
  destId: string
): string[] | null => {
  if (!graph || !sourceId || !destId) return null;
  if (sourceId === destId) return [sourceId];

  const queue: string[][] = [[sourceId]];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentId = path[path.length - 1];

    if (currentId === destId) return path;

    const currentStation = graph.stations.find(s => s.stationId === currentId);
    if (!currentStation) continue;

    // Get neighbors from edges
    const neighbors = graph.edges
      .filter(edge => edge.from === currentId || edge.to === currentId)
      .map(edge => edge.from === currentId ? edge.to : edge.from);

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([...path, neighborId]);
      }
    }
  }

  return null;
};
