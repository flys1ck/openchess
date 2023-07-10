// TODO: does not work for rnb1QNnr/2k5/8/ppPp1P2/8/7p/PPP1PP1P/RNB1KB1R w KQ - 0 1
export function isFEN(value: string) {
  return new RegExp(/^([pnbrqkPNBRQK1-8]{1,8}\/?){8}\s+(b|w)\s+(-|K?Q?k?q?)\s+(-|[a-h][3-6])\s+(\d+)\s+(\d+)$/).test(
    value
  );
}
