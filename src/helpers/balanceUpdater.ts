import { BalanceUpdaterArguments } from '../types';

const balanceUpdater = ({ oldBalance, cps, updatedAt }: BalanceUpdaterArguments) => {
  const secondsSinceLastUpdate = Math.floor((Date.now() - updatedAt.getTime()) / 1000)
  const newBalance = oldBalance + BigInt(Math.floor(cps) * secondsSinceLastUpdate)


  // Unaccurate, doesnt take in account the decimal part of cps. But players balance is so big that it doesnt matter.
  if(newBalance > Number.MAX_SAFE_INTEGER) return newBalance
  // Accurate, takes in account the decimal part of cps too.
  else return BigInt(Math.floor(Number(oldBalance) + cps * secondsSinceLastUpdate));
};

export default balanceUpdater;
