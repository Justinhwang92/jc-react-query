import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { PostDetail } from './PostDetail';

const maxPostPage = 10; // there are 100 posts total

async function fetchPosts(pageNum) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${pageNum}`
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    // prefetch the next page of posts
    if (currentPage < maxPostPage) {
      queryClient.prefetchQuery(
        ['posts', currentPage + 1], // query key for the next page
        () => fetchPosts(currentPage + 1) // fetch the next page
      );
    }
  }, [currentPage, queryClient]);

  const { data, isError, error, isLoading } = useQuery(
    ['posts', currentPage], // when currentPage changes, this query will be refetched
    () => fetchPosts(currentPage), // fetchPosts will be called with currentPage as the argument
    {
      staleTime: 2000,
      keepPreviousData: true, // keep the previous data around while we fetch the next page
    }
  );

  // early return while loading
  if (isLoading) return <h3>Loading...</h3>;
  // early return if there is an error
  if (isError)
    return (
      <>
        <h3>Error fetching posts</h3>
        <p>{error}</p>
      </>
    );

  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
          disabled={currentPage <= 1}
          onClick={() => {
            setCurrentPage((previousValue) => previousValue - 1);
          }}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => {
            setCurrentPage((previousValue) => previousValue + 1);
          }}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
