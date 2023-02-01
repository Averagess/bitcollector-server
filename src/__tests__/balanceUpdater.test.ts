import balanceUpdater from "../helpers/balanceUpdater";

describe("balanceUpdater", () => {
  it("With cps 1, balance 0, should return balance as 1 after 1 second has passed", () => {
    const oldBalance = BigInt(0);
    const cps = 1;
    const updatedAt = new Date(Date.now() - 1000)

    const expected = BigInt(1)

    const result = balanceUpdater({oldBalance, cps, updatedAt});  
    expect(result).toBe(expected);
  });

  it("With cps 1000, balance 1250, should return 16250 after 15 secs have passed", () => {
    const oldBalance = BigInt(1250)
    const cps = 1000
    const updatedAt = new Date(Date.now() - 15000)

    const expected = BigInt(16250)

    const result = balanceUpdater({oldBalance, cps, updatedAt});
    expect(result).toBe(expected);
  })

  it("With cps 0, Balance 0, should return 0 after 10 000 seconds have passed", () => {
    const oldBalance = BigInt(0)
    const cps = 0
    const updatedAt = new Date(Date.now() - 10_000_000)

    const expected = BigInt(0)

    const result = balanceUpdater({oldBalance, cps, updatedAt});
    expect(result).toBe(expected);
  })

  it("With cps 1.5 and balance 0, should return 3 after 2 seconds have passed", () => {
    const oldBalance = BigInt(0)
    const cps = 1.5
    const updatedAt = new Date(Date.now() - 2000)

    const expected = BigInt(3)

    const result = balanceUpdater({oldBalance, cps, updatedAt});
    expect(result).toBe(expected);
  })
});