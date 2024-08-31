import { useEffect, useState } from 'react';
import api from '../services/api';
import EditProfileModal from '../components/modals/EditProfile';
import Navbar from '../components/Navbar';
import PostPreview from '../components/PostPreview';
import DraftPreview from '../components/DraftPreview';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const [profileMeta, setProfileMeta] = useState({});
  const [posts, setPosts] = useState([]);
  const [selectedTab, setSelectedTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { userId } = useParams();
  const loggedInUserId = localStorage.getItem('userId'); // Get the logged-in user's ID

  // Modal handlers
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setProfileMeta(response.data.user);
      } catch (error) {
        console.error('Error fetching profile meta', error);
      }
    };

    const fetchPostsData = async () => {
      try {
        let response;
        switch (selectedTab) {
          case 'posts':
            response = await api.get(`/users/${userId}/posts`);
            break;
          case 'liked':
            response = await api.get(`/users/${userId}/liked`);
            break;
          case 'commented':
            response = await api.get(`/users/${userId}/commented`);
            break;
          case 'drafts':
            if (userId === loggedInUserId) {
              response = await api.get(`/users/${userId}/drafts`);
            } else {
              response = { data: { posts: [] } }; // Prevent showing drafts to others
            }
            break;
          default:
            response = { data: { posts: [] } }; // Fallback
            break;
        }
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
  }, [userId, selectedTab, loggedInUserId]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="profile-page container mx-auto p-4">
        <div className="profile-header flex items-center space-x-4">
          <img
            src={profileMeta.profilePictureUrl || 'default-profile-picture-url'}
            alt={`${profileMeta.username}'s profile`}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="user-info">
            <h1 className="text-3xl font-bold">{profileMeta.username}</h1>
            <p className="text-gray-600">{profileMeta.bio || 'No bio available'}</p>
            {userId === loggedInUserId && (
              <div>
                <button onClick={handleModalOpen}>Edit Profile</button>
                <EditProfileModal
                  open={isModalOpen}
                  handleModalClose={handleModalClose}
                  user={profileMeta}
                  userId={userId}
                  setProfileMeta={setProfileMeta}
                />
              </div>
            )}
          </div>
        </div>

        <section className="profile-stats mt-4">
          <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-item text-center">
              <h2 className="text-lg font-semibold">{profileMeta._count?.posts || 0}</h2>
              <p className="text-gray-500">Posts</p>
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
            {userId === loggedInUserId && (
              <button
                className={`tab-button ${selectedTab === 'drafts' ? 'border' : ''}`}
                onClick={() => setSelectedTab('drafts')}
              >
                Drafts
              </button>
            )}
          </div>
        </section>

        <section className="profile-content mt-4">
          <h2 className="text-2xl font-semibold">
            {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
          </h2>
          <div className="posts-list mt-4">
            {posts.length > 0 ? (
              selectedTab === 'drafts'
                ? posts.map(post => (
                    <DraftPreview
                      postId={post.id}
                      key={post.id}
                    />
                  ))
                : posts.map(post => (
                    <PostPreview
                      postId={post.id}
                      key={post.id}
                      isEditable={userId === loggedInUserId}
                    />
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