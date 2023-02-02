import items from "../items";
import { Item } from "../types";

function weightedRandom(min: number, max: number) {
  return Math.round(max / (Math.random() * max + min));
}

/*
  Following function returns a random item from the items array.
  The probability of an item being returned is based on the item's position in the array.
  The first item in the array has the highest probability of being returned.
  The last item in the array has the lowest probability of being returned.
*/
const randomItemDrop = (): Item => {
  const randomIndex = weightedRandom(1, items.length - 1) - 1;

  return items[randomIndex];
};

export default randomItemDrop;