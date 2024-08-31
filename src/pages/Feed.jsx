import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostPreview from '../components/PostPreview';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts/');
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching posts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="feed-page container mx-auto p-4">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-4">Feed</h1>

        {/* Post Content */}
        <section className="feed-content">
          <div className="posts-list mt-4">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostPreview postId={post.id} key={post.id} />
              ))
            ) : (
              <p>No posts available</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Feed;
