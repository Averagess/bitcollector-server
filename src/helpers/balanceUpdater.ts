import { BalanceUpdaterArguments } from '../types';

const balanceUpdater = ({ oldBalance, cps, updatedAt }: BalanceUpdaterArguments) => {
  const secondsSinceLastUpdate = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const newBalance = oldBalance + BigInt(Math.floor(cps) * secondsSinceLastUpdate)

  if(newBalance > Number.MAX_SAFE_INTEGER) {
    return newBalance
  }
  
  return BigInt(Math.floor(Number(oldBalance) + cps * secondsSinceLastUpdate));
};

export default balanceUpdater;
