import { parseCSV } from "../utils/parseCSV";

describe("parseCSV", () => {
  it("parses CSV with headers and rows", () => {
    const csv = "a,b,c\n1,2,3\n4,5,6";
    const { headers, rows } = parseCSV(csv);
    expect(headers).toEqual(["a", "b", "c"]);
    expect(rows).toEqual([
      { a: "1", b: "2", c: "3" },
      { a: "4", b: "5", c: "6" },
    ]);
  });
});
