import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import PostPreview from './PostPreview';
import DraftPreview from './DraftPreview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowsRotate, faArrowUp, faSort } from '@fortawesome/free-solid-svg-icons';

const PostsList = ({ sourceId, type }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const loggedInUserId = localStorage.getItem('userId');
  const limit = 10;

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
            response = { data: { posts: [] } };
            break;
        }

        if (response.data.posts.length < limit) {
          setHasMore(false);
        }

        setPosts(prevPosts => [...prevPosts, ...response.data.posts]);
      } catch (error) {
        console.error('Error fetching posts data', error);
      } finally {
        setLoading(false);
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
    resetPost();
    setRefresh(prev => !prev);
  };

  const handleSortChange = (e) => {
    setSortField(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className='flex'>
          <div className="relative">
            {/* Sort Dropdown */}
              <select
              className="block w-full bg-gray-700 border border-gray-600 text-gray-300 py-2 px-4 pr-8 rounded-lg appearance-none focus:outline-none"
              value={type === 'user_drafts' ? 'New' : sortField}
              onChange={handleSortChange}
              disabled={type === 'user_drafts'}
            >
              <option value="createdAt">New</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
            </select>
            <div className="text-sm pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <FontAwesomeIcon icon={faSort} />
            </div>
          </div>

          {/* Sort Order Button */}
          <button
            className='ml-4 flex items-center p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition'
            onClick={toggleSortOrder}
            disabled={type === 'user_drafts'}
            aria-label="Toggle sort order"
          >
            <span className="text-sm">{sortOrder === 'asc' ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown}/>} </span>
          </button>
        </div>

        <div className='flex items-center justify-center'>
          <button
            onClick={handleRefresh}
            className='flex items-center p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition'
          >  
            <FontAwesomeIcon icon={faArrowsRotate} />
          </button>
        </div>
      </div>

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
        !loading && <p className="text-gray-500 text-center mt-8">No posts available.</p>
      )}

      {loading && <p className="text-center text-gray-500 mt-4">Loading more posts...</p>}
    </div>
  );
};

export default PostsList;
