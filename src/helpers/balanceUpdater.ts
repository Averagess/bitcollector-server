interface Arguments {
  oldBalance: bigint;
  cps: bigint;
  updatedAt: Date;
}
const balanceUpdater = ({ oldBalance, cps, updatedAt }: Arguments) => {
  const secondsSinceLastUpdate = BigInt(
    Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  );

  return oldBalance + cps * secondsSinceLastUpdate;
};

export default balanceUpdater;
