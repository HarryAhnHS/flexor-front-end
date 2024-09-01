import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PostPreview from '../components/PostPreview';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // State to track the active tab

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'All' ? '/posts/' : '/posts/feed';
        const response = await api.get(endpoint);
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching posts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab]); // Re-fetch posts when the active tab changes

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="feed-page container mx-auto p-4">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-4">Feed</h1>

        {/* Tabs for All and Following */}
        <div className="tabs flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('All')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'Following' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('Following')}
          >
            Following
          </button>
        </div>

        {/* Post Content */}
        <section className="feed-content">
          <div className="posts-list mt-4">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostPreview postId={post.id} key={post.id} />
              ))
            ) : (
              <p className="text-gray-600 text-center mt-8">
                No posts available.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Feed;
