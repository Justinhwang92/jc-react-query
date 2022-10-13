import InfiniteScroll from 'react-infinite-scroller';
import { useInfiniteQuery } from 'react-query';
import { Person } from './Person';

const initialUrl = 'https://swapi.dev/api/people/';
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfinitePeople() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery(
    'sw-people', // unique key
    ({ pageParam = initialUrl }) => fetchUrl(pageParam), // fetch function
    {
      getNextPageParam: (lastPage) => lastPage.next || undefined, // pagination function
    }
  );

  // early return while loading
  if (isLoading) return <div className="loading">Loading...</div>;
  // early return for error
  if (isError) return <div className="error">{error.toString()}</div>;

  return (
    <>
      {isFetching && <div className="loading">Loading...</div>}
      {/* get data for InfiniteScroll via React Query */}
      <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
        {data?.pages.map((pageData) => {
          return pageData.results.map((person) => {
            return (
              <Person
                key={person.name}
                name={person.name}
                hairColor={person.hair_color}
                eyeColor={person.eye_color}
              />
            );
          });
        })}
      </InfiniteScroll>
    </>
  );
}
