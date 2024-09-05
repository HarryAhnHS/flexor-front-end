import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import PostPreview from './PostPreview';
import DraftPreview from './DraftPreview';

const PostsList = ({ sourceId, type }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1); // Track the current page
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const [sortField, setSortField] = useState('createdAt'); // Default sort field (newest)
  const [sortOrder, setSortOrder] = useState('desc'); // Default sort order (descending)
  const loggedInUserId = localStorage.getItem('userId');
  const limit = 10; // Number of posts per page

  const resetPost = useCallback(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, []);

  useEffect(() => {
    resetPost();
  }, [sourceId, type, sortField, sortOrder, resetPost]);

  useEffect(() => {
    const fetchPostsData = async () => {
      try {
        setLoading(true);
        let response;
        switch (type) {
          case 'user_posts':
            response = await api.get(`/users/${sourceId}/posts`, {
              params: { page, limit, sortField, sortOrder }
            });
            break;
          case 'user_liked':
            response = await api.get(`/users/${sourceId}/liked`, {
              params: { page, limit, sortField, sortOrder }
            });
            break;
          case 'user_commented':
            response = await api.get(`/users/${sourceId}/commented`, {
              params: { page, limit, sortField, sortOrder }
            });
            break;
          case 'user_drafts':
            // Lock sorting for drafts to 'Newest'
            response = await api.get(`/users/${sourceId}/drafts`, {
              params: { page, limit, sortField: 'createdAt', sortOrder: 'desc' }
            });
            break;
          case 'posts_all':
            response = await api.get(`/posts/`, {
              params: { page, limit, sortField, sortOrder }
            });
            break;
          case 'posts_following':
            response = await api.get(`/posts/feed`, {
              params: { page, limit, sortField, sortOrder }
            });
            break;
          case 'realm_posts':
            response = await api.get(`/realms/${sourceId}/posts`, {
              params: { page, limit, sortField, sortOrder }
            });
            break;
          default:
            response = { data: { posts: [] } }; // Fallback
            break;
        }

        if (response.data.posts.length < limit) {
          setHasMore(false); // No more posts to load
        }

        setPosts(prevPosts => [...prevPosts, ...response.data.posts]); // Append new posts
      } catch (error) {
        console.error('Error fetching posts data', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchPostsData();
  }, [sourceId, type, loggedInUserId, page, sortField, sortOrder, refresh]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        hasMore &&
        !loading
      ) {
        setPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  const handleRefresh = () => {
    resetPost(); // Clear current posts
    setRefresh(prev => !prev); // Trigger refresh
  };

  const handleSortChange = (e) => {
    setSortField(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="posts-list">
      <div className="sort-container mb-4 flex items-center">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={type === 'user_drafts' ? 'New' : sortField }
            onChange={handleSortChange}
            disabled={type === 'user_drafts'} // Disable dropdown if type is 'user_drafts'
          >
            <option value="createdAt">New</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.5 7.5L10 2.5l4.5 5h-9zM5.5 12.5l4.5 5 4.5-5h-9z" />
            </svg>
          </div>
        </div>

        {/* Sort Order Button */}
        <button
          className='ml-2 flex items-center p-2 border border-gray-300 rounded hover:bg-gray-100 bg-white'
          onClick={toggleSortOrder}
          disabled={type === 'user_drafts'}
          aria-label="Toggle sort order"
        >
          <span className="ml-1 text-sm text-gray-600">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
        </button>
      </div>

      <button onClick={handleRefresh}>
        Refresh
      </button>
      
      {posts.length > 0 ? (
        posts.map(post =>
          type === 'user_drafts' ? (
            <DraftPreview
              postId={post.id}
              posts={posts}
              setPosts={setPosts}
              key={post.id}
            />
          ) : (
            <PostPreview
              postId={post.id}
              isEditable={post.authorId === loggedInUserId}
              posts={posts}
              setPosts={setPosts}
              key={post.id}
            />
          )
        )
      ) : (
        !loading && <p className="text-gray-600 text-center mt-8">No posts available.</p>
      )}

      {loading && <p className="text-center text-gray-500">Loading more posts...</p>}
    </div>
  );
};

export default PostsList;