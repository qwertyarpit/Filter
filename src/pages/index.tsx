import React, { useEffect, useState, useMemo, useRef } from "react";
import { useBookmarks } from "./_app";
import { parseCSV } from "../utils/parseCSV";
import { applyFilters } from "../utils/filterUtils";

const csvUrl = "/data/dataset_large.csv";

//Filter Dropdown
type FilterDropdownProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(
    () =>
      options.filter(
        (opt) =>
          typeof opt === "string" &&
          opt.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Closing the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative inline-block w-48 mr-4 mb-2">
      <button
        className="w-full border rounded px-3 py-2 bg-white text-left shadow-sm text-black"
        onClick={() => setOpen((o) => !o)}
        type="button">
        <span className="font-semibold mr-2">{label}:</span>
        <span className="text-gray-800">
          {selected.length ? selected.join(", ") : "All"}
        </span>
        <span className="float-right">▼</span>
      </button>
      {open && (
        <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto text-black">
          <input
            className="w-full px-2 py-1 border-b outline-none text-black"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div>
            {filteredOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer text-black">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-2 py-2 text-gray-400">No options</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [rowWindow, setRowWindow] = useState(0); 
  const rowsPerPage = 100;
  const windowSize = 20;
  const maxWindow = Math.ceil(rowsPerPage / windowSize) - 1;

  // Filter state
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [viewBookmarks, setViewBookmarks] = useState(false);

  useEffect(() => {
    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        try {
          const parsed = parseCSV(text);
          setHeaders(parsed.headers);
          setData(parsed.rows);
        } catch {
          setError("Failed to parse CSV");
        }
      })
      .catch(() => setError("Failed to load CSV"));
  }, []);


  const filterColumns = useMemo(() => headers.slice(1), [headers]);

  
  const effectiveData = viewBookmarks
    ? data.filter((row) => isBookmarked(row))
    : data;

  // Filtering logi
  const filteredData = useMemo(() => {
    return applyFilters(effectiveData, filters, filterColumns);
  }, [effectiveData, filters, filterColumns]);

  
  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    for (const col of filterColumns) {
      
      const tempFilters = { ...filters, [col]: [] };
      const tempFiltered = applyFilters(data, tempFilters, filterColumns);
      opts[col] = Array.from(new Set(tempFiltered.map((row) => row[col])));
    }
    return opts;
  }, [data, filters, filterColumns]);

  // Pagination
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

 
  const handlePrevWindow = () => setRowWindow((w) => Math.max(0, w - 1));
  const handleNextWindow = () =>
    setRowWindow((w) => Math.min(maxWindow, w + 1));

 
  useEffect(() => {
    setRowWindow(0);
  }, [page, filters]);

  const windowedRows = paginatedData.slice(
    rowWindow * windowSize,
    (rowWindow + 1) * windowSize
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Filter Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Filter Dropdown */}
      <div className="flex flex-wrap gap-2 mb-6 w-full max-w-4xl">
        {filterColumns.map((col) => (
          <FilterDropdown
            key={col}
            label={col}
            options={filterOptions[col] || []}
            selected={filters[col] || []}
            onChange={(vals) => setFilters((f) => ({ ...f, [col]: vals }))}
          />
        ))}
      </div>

      {}
      <div className="w-full max-w-4xl flex justify-between mb-2">
        <button
          onClick={() => setFilters({})}
          className="px-4 py-2 rounded border bg-red-50 border-red-300 text-red-700 text-sm font-semibold shadow-sm hover:bg-red-100 transition-colors">
          Clear All Filters
        </button>
        <button
          onClick={() => setViewBookmarks((v) => !v)}
          className={`px-4 py-2 rounded border text-sm font-semibold shadow-sm transition-colors ${
            viewBookmarks
              ? "bg-yellow-100 border-yellow-400 text-yellow-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}>
          {viewBookmarks ? "Show All Rows" : "View Bookmarks"}
        </button>
      </div>

      {/* Table */}
      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-2">Data Table</h2>
        <div className="overflow-x-auto border rounded shadow-sm">
          <table className="min-w-full text-xs text-left table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 font-bold border-b text-black whitespace-nowrap text-center">
                  ★
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-2 py-1 font-bold border-b text-black whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {windowedRows.map((row: Record<string, string>, i: number) => (
                <tr key={i} className="bg-white" style={{ width: "100%" }}>
                  {/* Bookmark button */}
                  <td className="px-2 py-1 border-b text-center">
                    <button
                      onClick={() =>
                        isBookmarked(row)
                          ? removeBookmark(row)
                          : addBookmark(row)
                      }
                      className={
                        "focus:outline-none text-xl " +
                        (isBookmarked(row)
                          ? "text-yellow-500"
                          : "text-gray-400")
                      }
                      title={
                        isBookmarked(row) ? "Remove Bookmark" : "Add Bookmark"
                      }>
                      {isBookmarked(row) ? "★" : "☆"}
                    </button>
                  </td>
                  {headers.map((header, j) => (
                    <td
                      key={j}
                      className="px-2 py-1 border-b truncate text-black">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Navigation for 20-20 rows*/}
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-2 py-1 border-b bg-gray-50 text-black">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handlePrevWindow}
                      disabled={rowWindow === 0}
                      className="px-2 py-1 rounded border bg-white text-xs text-black disabled:opacity-50">
                      Prev 20
                    </button>
                    <span className="text-xs text-black">
                      Rows {rowWindow * windowSize + 1}–
                      {Math.min(
                        (rowWindow + 1) * windowSize,
                        paginatedData.length
                      )}{" "}
                      of {paginatedData.length}
                    </span>
                    <button
                      onClick={handleNextWindow}
                      disabled={
                        rowWindow === maxWindow ||
                        (rowWindow + 1) * windowSize >= paginatedData.length
                      }
                      className="px-2 py-1 rounded border bg-white text-xs text-black disabled:opacity-50">
                      Next 20
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-base font-semibold text-black shadow-sm hover:bg-gray-100 disabled:opacity-50 transition-colors">
            <span className="text-lg">&#8592;</span> Prev Page
          </button>
          <span className="text-base font-medium text-white">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-base font-semibold text-black shadow-sm hover:bg-gray-100 disabled:opacity-50 transition-colors">
            Next Page <span className="text-lg">&#8594;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
