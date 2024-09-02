import { useEffect, useState } from 'react';
import api from '../services/api';
import EditProfileModal from '../components/modals/EditProfile';
import Navbar from '../components/Navbar';
import PostPreview from '../components/PostPreview';
import DraftPreview from '../components/DraftPreview';
import { useParams, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileMeta, setProfileMeta] = useState({});
  const [posts, setPosts] = useState([]);
  const [followed, setFollowed] = useState(null);
  const [selectedTab, setSelectedTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { userId } = useParams();
  const loggedInUserId = localStorage.getItem('userId');

  // Modal handlers
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setProfileMeta(response.data.user);
      } 
      catch (error) {
        console.error('Error fetching profile meta', error);
      }
    };

    const fetchFollowedState = async () => {
      try {
        const response = await api.get(`/users/${userId}/followers`);
        const followedUsers = response.data.users.map(user => user.id);
        setFollowed(followedUsers.includes(loggedInUserId)); // Check if the logged-in user is in the followers list
      } 
      catch (error) {
        console.error('Error fetching user follow state', error);
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
      } 
      catch (error) {
        console.error('Error fetching posts data', error);
      }
    };

    if (userId) {
      fetchMetaData();
      fetchFollowedState();
      fetchPostsData();
      setLoading(false);
    }
  }, [userId, selectedTab, loggedInUserId]);

  const handleFollowToggle = async () => {
    try {
      if (followed) {
        await api.delete(`/users/${userId}/follow`);
        const newMeta = { ...profileMeta };
        newMeta._count.followers--;
        setProfileMeta(newMeta);
      } 
      else {
        await api.post(`/users/${userId}/follow`);
        const newMeta = { ...profileMeta };
        newMeta._count.followers++;
        setProfileMeta(newMeta);
      }
      setFollowed(!followed);
    } 
    catch (error) {
      console.error('Error following/unfollowing user', error);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="profile-page container mx-auto p-4">
        {/* Profile Header */}
        <div className="profile-header flex items-center space-x-4 mb-4">
          <img
            src={profileMeta.profilePictureUrl}
            alt={`${profileMeta.username}'s profile`}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="user-info">
            <h1 className="text-3xl font-bold">{profileMeta.username}</h1>
            <p className="text-gray-600">{profileMeta.bio || 'No bio available'}</p>
            {userId === loggedInUserId ? (
              <div>
                <button
                  onClick={handleModalOpen}
                  className="py-2 px-4 rounded bg-blue-500 text-white"
                >
                  Edit Profile
                </button>
                <EditProfileModal
                  open={isModalOpen}
                  handleModalClose={handleModalClose}
                  user={profileMeta}
                  userId={userId}
                  setProfileMeta={setProfileMeta}
                />
              </div>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${
                  followed ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}
              >
                {followed ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <section className="profile-stats mb-4">
          <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-item text-center" >
              <h2 className="text-lg font-semibold">{profileMeta._count?.posts || 0}</h2>
              <p className="text-gray-500">Posts</p>
            </div>
            <div className="stat-item text-center cursor-pointer" onClick={() => navigate(`/users/${userId}/followers`)}>
              <h2 className="text-lg font-semibold">{profileMeta._count?.followers || 0}</h2>
              <p className="text-gray-500">Followers</p>
            </div>
            <div className="stat-item text-center cursor-pointer" onClick={() => navigate(`/users/${userId}/following`)}>
              <h2 className="text-lg font-semibold">{profileMeta._count?.following || 0}</h2>
              <p className="text-gray-500">Following</p>
            </div>
          </div>
        </section>

        {/* Tabs for Posts, Liked, Commented, Drafts */}
        <section className="tabs mb-4">
          <div className="tabs-buttons flex space-x-4">
            <button
              className={`px-4 py-2 rounded ${selectedTab === 'posts' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setSelectedTab('posts')}
            >
              Posts
            </button>
            <button
              className={`px-4 py-2 rounded ${selectedTab === 'liked' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setSelectedTab('liked')}
            >
              Liked
            </button>
            <button
              className={`px-4 py-2 rounded ${selectedTab === 'commented' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setSelectedTab('commented')}
            >
              Commented
            </button>
            {userId === loggedInUserId && (
              <button
                className={`px-4 py-2 rounded ${selectedTab === 'drafts' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setSelectedTab('drafts')}
              >
                Drafts
              </button>
            )}
          </div>
        </section>

        {/* Posts Content */}
        <section className="profile-content">
          <h2 className="text-2xl font-semibold mb-4">
            {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
          </h2>
          <div className="posts-list">
            {posts.length > 0 ? (
              selectedTab === 'drafts'
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
                      isEditable={userId === loggedInUserId}
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
        </section>
      </div>
    </>
  );
};

export default ProfilePage;
