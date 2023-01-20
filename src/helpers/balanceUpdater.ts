interface Arguments {
  oldBalance: bigint;
  cps: number;
  updatedAt: Date;
}
const balanceUpdater = ({ oldBalance, cps, updatedAt }: Arguments) => {
  const secondsSinceLastUpdate = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const newBalance = oldBalance + BigInt(Math.floor(cps) * secondsSinceLastUpdate)

  if(newBalance > Number.MAX_SAFE_INTEGER) {
    return newBalance
  }
  
  return BigInt(Math.floor(Number(oldBalance) + cps * secondsSinceLastUpdate));
};

export default balanceUpdater;
