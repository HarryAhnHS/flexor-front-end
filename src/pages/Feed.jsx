import { useState } from 'react';
import PostsList from '../components/PostsList';

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('posts_all'); // State to track the active tab

  return (
    <>
      <div className="feed-page container mx-auto p-4">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-4">Feed</h1>

        {/* Tabs for All and Following */}
        <div className="tabs flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'posts_all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('posts_all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'posts_following' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('posts_following')}
          >
            Following
          </button>
        </div>

        {/* Post Content */}
        <section>
          <PostsList 
            sourceId={null}
            type={activeTab}
          />
        </section>
      </div>
    </>
  );
};

export default FeedPage;
