import { useState } from 'react';
import PostsList from '../components/PostsList';

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('posts_all'); // State to track the active tab

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      {/* Page Title and Tabs */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Feed</h1>
          {/* Tabs for All and Following */}
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'posts_all' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
              onClick={() => setActiveTab('posts_all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'posts_following' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
              onClick={() => setActiveTab('posts_following')}
            >
              Following
            </button>
          </div>
        </div>

        {/* Post Content */}
        <PostsList 
          sourceId={null}
          type={activeTab}
        />
      </div>
    </div>
  );
};

export default FeedPage;
