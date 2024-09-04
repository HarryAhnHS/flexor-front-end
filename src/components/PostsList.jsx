import { useEffect, useState } from 'react';
import api from '../services/api';
import PostPreview from './PostPreview';
import DraftPreview from './DraftPreview';

const PostsList = ({ sourceId, type }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Track the current page
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const loggedInUserId = localStorage.getItem('userId');
  const limit = 10; // Number of posts per page

  useEffect(() => {
    console.log("PostsList: Reset useeffect running")
    // Clear posts when sourceId or type changes
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [sourceId, type]);

  useEffect(() => {
    const fetchPostsData = async () => {
      try {
        setLoading(true);
        let response;
        switch (type) {
          case 'user_posts':
            response = await api.get(`/users/${sourceId}/posts`, { params: { page, limit } });
            break;
          case 'user_liked':
            response = await api.get(`/users/${sourceId}/liked`, { params: { page, limit } });
            break;
          case 'user_commented':
            response = await api.get(`/users/${sourceId}/commented`, { params: { page, limit } });
            break;
          case 'user_drafts':
            response = await api.get(`/users/${sourceId}/drafts`, { params: { page, limit } });
            break;
          case 'posts_all':
            response = await api.get(`/posts/`, { params: { page, limit } });
            break;
          case 'posts_following':
            response = await api.get(`/posts/feed`, { params: { page, limit } });
            break;
          case 'realm_posts':
            response = await api.get(`/realms/${sourceId}/posts`, { params: { page, limit } });
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
        setTimeout( async () => {
            setLoading(false);
          }, 1000)
      }
    };

    fetchPostsData();
  }, [sourceId, type, loggedInUserId, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore && !loading) {
        setPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="posts-list">
      {posts.length > 0 ? (
        posts.map(post => (
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
        ))
      ) : (
        !loading && <p className="text-gray-600 text-center mt-8">No posts available.</p>
      )}
      {loading && <p className="text-center text-gray-500">Loading more posts...</p>}
    </div>
  );
};

export default PostsList;