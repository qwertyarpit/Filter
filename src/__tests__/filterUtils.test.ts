import { applyFilters } from "../filterUtils";

describe("applyFilters", () => {
  const testData = [
    { number: "1", mod350: "0", mod8000: "1" },
    { number: "2", mod350: "1", mod8000: "0" },
    { number: "3", mod350: "0", mod8000: "0" },
    { number: "4", mod350: "1", mod8000: "1" },
  ];

  it("returns all data when no filters are applied", () => {
    const filters = {};
    const filterColumns = ["mod350", "mod8000"];
    const result = applyFilters(testData, filters, filterColumns);
    expect(result).toEqual(testData);
  });

  it("filters data by single column", () => {
    const filters = { mod350: ["0"] };
    const filterColumns = ["mod350", "mod8000"];
    const result = applyFilters(testData, filters, filterColumns);
    expect(result).toEqual([
      { number: "1", mod350: "0", mod8000: "1" },
      { number: "3", mod350: "0", mod8000: "0" },
    ]);
  });

  it("filters data by multiple columns", () => {
    const filters = { mod350: ["0"], mod8000: ["1"] };
    const filterColumns = ["mod350", "mod8000"];
    const result = applyFilters(testData, filters, filterColumns);
    expect(result).toEqual([{ number: "1", mod350: "0", mod8000: "1" }]);
  });

  it("returns empty array when no data matches filters", () => {
    const filters = { mod350: ["2"] };
    const filterColumns = ["mod350", "mod8000"];
    const result = applyFilters(testData, filters, filterColumns);
    expect(result).toEqual([]);
  });
});
