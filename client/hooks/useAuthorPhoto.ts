import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAuthorPhoto(authorName: string): string | null {
  const { data } = useSWR(
    authorName
      ? `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(authorName)}&limit=1`
      : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const olid = data?.docs?.[0]?.key; // e.g. "OL18394A"
  if (!olid) return null;
  return `https://covers.openlibrary.org/a/olid/${olid}-M.jpg`;
}
