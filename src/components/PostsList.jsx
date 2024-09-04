import { useEffect, useState } from 'react';
import api from '../services/api';
import PostPreview from './PostPreview';
import DraftPreview from './DraftPreview';

const PostsList = ({ sourceId, type }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const loggedInUserId = localStorage.getItem('userId')


  useEffect(() => {
    const fetchPostsData = async () => {
      try {
            let response;
            switch (type) {
                // User posts
                case 'user_posts':
                    response = await api.get(`/users/${sourceId}/posts`);
                    break;
                case 'user_liked':
                    response = await api.get(`/users/${sourceId}/liked`);
                    break;
                case 'user_commented':
                    response = await api.get(`/users/${sourceId}/commented`);
                    break;
                case 'user_drafts':
                    response = await api.get(`/users/${sourceId}/drafts`);
                    break;
                case 'posts_all':
                    response = await api.get(`/posts/`);
                    break;
                case 'posts_following':
                    response = await api.get(`/posts/feed`);
                    break;
                case 'realm_posts':
                    response = await api.get(`/realms/${sourceId}/posts`);
                    break;
                default:
                    response = { data: { posts: [] } }; // Fallback
                    break;
            }
        setPosts(response.data.posts);
        setLoading(false);
      } 
      catch (error) {
        console.error('Error fetching posts data', error);
        setLoading(false);
      }
    };

    fetchPostsData();
  }, [sourceId, type, loggedInUserId]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
      <div className="posts-list">
        {posts.length > 0 ? (
          type === 'user_drafts'
            ? posts.map(post => (
                <DraftPreview
                  postId={post.id}
                  posts={posts}
                  setPosts={setPosts}
                  key={post.id}
                />
              ))
            : posts.map(post => (
                <PostPreview
                  postId={post.id}
                  isEditable={post.authorId === loggedInUserId}
                  posts={posts}
                  setPosts={setPosts}
                  key={post.id}
                />
              ))
        ) : (
          <p className="text-gray-600 text-center mt-8">
            No posts available.
          </p>
        )}
      </div>
  );
};

export default PostsList;
