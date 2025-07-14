import type { AppProps } from "next/app";
import "../app/globals.css";
import React, { createContext, useContext, useState } from "react";


export function getRowKey(row: Record<string, string>): string {
  return Object.values(row).join("|");
}

interface BookmarkContextType {
  bookmarks: Set<string>;
  addBookmark: (row: Record<string, string>) => void;
  removeBookmark: (row: Record<string, string>) => void;
  isBookmarked: (row: Record<string, string>) => boolean;
}
const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

export const useBookmarks = () => {
  const ctx = useContext(BookmarkContext);
  if (!ctx)
    throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
};

const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const addBookmark = (row: Record<string, string>) => {
    setBookmarks((prev) => new Set(prev).add(getRowKey(row)));
  };
  const removeBookmark = (row: Record<string, string>) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.delete(getRowKey(row));
      return next;
    });
  };
  const isBookmarked = (row: Record<string, string>) =>
    bookmarks.has(getRowKey(row));
  return (
    <BookmarkContext.Provider
      value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <BookmarkProvider>
      <Component {...pageProps} />
    </BookmarkProvider>
  );
}

export default MyApp;
