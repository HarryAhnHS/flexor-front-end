import { useEffect, useState } from 'react';
import api from '../services/api';

import EditProfileModal from '../components/modals/EditProfile';
import Navbar from '../components/Navbar';
import PostPreview from '../components/PostPreview';

const ProfilePage = () => {
  const [profileMeta, setProfileMeta] = useState({});
  const [posts, setPosts] = useState([]);
  const [selectedTab, setSelectedTab] = useState('posts'); // Default tab


  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get logged user Id
  const userId = localStorage.getItem("userId");

  // Modal stuff
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        console.log('Profile meta response:', response);
        setProfileMeta(response.data.user);
      } catch (error) {
        console.error('Error fetching profile meta', error);
      }
    };
    const fetchPostsData = async () => {
      try {
        let response;
        if (selectedTab === 'posts') {
          response = await api.get(`/${userId}/posts`);
        } else if (selectedTab === 'liked') {
          response = await api.get(`/${userId}/liked`);
        } else if (selectedTab === 'commented') {
          response = await api.get(`/${userId}/commented`);
        }

        console.log('Posts Response:', response);
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching posts data', error);
      }
    };

    if (userId) {
      fetchMetaData();
      fetchPostsData();
      setLoading(false);
    }
  }, [userId, selectedTab]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="profile-page container mx-auto p-4">
        <div className="profile-header flex items-center space-x-4">
          {/* Profile Picture */}
          <img
            src={profileMeta.profilePictureUrl || 'default-profile-picture-url'}
            alt={`${profileMeta.username}'s profile`}
            className="w-24 h-24 rounded-full object-cover"
          />
  
          {/* User Information */}
          <div className="user-info">
            <h1 className="text-3xl font-bold">{profileMeta.username}</h1>
            <p className="text-gray-600">{profileMeta.bio || 'No bio available'}</p>
            <div>
              <button onClick={handleModalOpen}>Edit Profile</button>
              {profileMeta &&
                (<EditProfileModal
                  open={isModalOpen}
                  handleModalClose={handleModalClose}
                  user={profileMeta}
                  userId={userId}
                  setProfileMeta={setProfileMeta}
                />)
              }
            </div>
          </div>
        </div>
  
        {/* Profile Statistics */}
        <section className="profile-stats mt-4">
          <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-item text-center">
              <h2 className="text-lg font-semibold">{profileMeta._count?.posts || 0}</h2>
              <p className="text-gray-500">Posts</p>
            </div>
            <div className="stat-item text-center">
              <h2 className="text-lg font-semibold">{profileMeta._count?.likes || 0}</h2>
              <p className="text-gray-500">Likes</p>
            </div>
            <div className="stat-item text-center">
              <h2 className="text-lg font-semibold">{profileMeta._count?.comments || 0}</h2>
              <p className="text-gray-500">Comments</p>
            </div>
            <div className="stat-item text-center">
              <h2 className="text-lg font-semibold">{profileMeta._count?.followers || 0}</h2>
              <p className="text-gray-500">Followers</p>
            </div>
            <div className="stat-item text-center">
              <h2 className="text-lg font-semibold">{profileMeta._count?.following || 0}</h2>
              <p className="text-gray-500">Following</p>
            </div>
          </div>
        </section>
  
        {/* Post Content */}
        <section className="profile-stats mt-4">
          <div className="tabs flex space-x-4">
            <button
              className={`tab-button ${selectedTab === 'posts' ? 'border' : ''}`}
              onClick={() => setSelectedTab('posts')}
            >
              Posts
            </button>
            <button
              className={`tab-button ${selectedTab === 'liked' ? 'border' : ''}`}
              onClick={() => setSelectedTab('liked')}
            >
              Liked
            </button>
            <button
              className={`tab-button ${selectedTab === 'commented' ? 'border' : ''}`}
              onClick={() => setSelectedTab('commented')}
            >
              Commented
            </button>
          </div>
        </section>

        <section className="profile-content mt-4">
          <h2 className="text-2xl font-semibold">{selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Posts</h2>
          <div className="posts-list mt-4">
            {posts.length ? (
              posts.map(post => (
                <PostPreview post={post} key={post.id}/>
              ))
            ) : (
              <p>No posts to display</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
  
};

export default ProfilePage;