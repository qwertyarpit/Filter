import { getRowKey } from "../bookmarkUtils";

describe("getRowKey", () => {
  it("creates a unique key for a row", () => {
    const row = { number: "123", mod350: "0", mod8000: "1" };
    const key = getRowKey(row);
    expect(key).toBe("123|0|1");
  });

  it("creates different keys for different rows", () => {
    const row1 = { number: "123", mod350: "0", mod8000: "1" };
    const row2 = { number: "123", mod350: "1", mod8000: "1" };
    const key1 = getRowKey(row1);
    const key2 = getRowKey(row2);
    expect(key1).not.toBe(key2);
  });

  it("creates the same key for identical rows", () => {
    const row1 = { number: "123", mod350: "0", mod8000: "1" };
    const row2 = { number: "123", mod350: "0", mod8000: "1" };
    const key1 = getRowKey(row1);
    const key2 = getRowKey(row2);
    expect(key1).toBe(key2);
  });
});
