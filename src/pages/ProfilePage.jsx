import { useEffect, useState } from 'react';
import api from '../services/api';
import EditProfileModal from '../components/modals/EditProfile';
import PostsList from '../components/PostsList';
import { useParams, useNavigate } from 'react-router-dom';
import { formatTimeNoSuffix } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUserPen, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileMeta, setProfileMeta] = useState({});
  const [followed, setFollowed] = useState(null);
  const [selectedTab, setSelectedTab] = useState('user_posts');
  const [cakeDay, setCakeDay] = useState(null);
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
        setCakeDay(response.data.user.createdAt);
      } catch (error) {
        console.error('Error fetching profile meta', error);
      }
    };

    const fetchFollowedState = async () => {
      try {
        const response = await api.get(`/users/${userId}/followers`);
        const followedUsers = response.data.users.map(user => user.id);
        setFollowed(followedUsers.includes(loggedInUserId)); // Check if the logged-in user is in the followers list
      } catch (error) {
        console.error('Error fetching user follow state', error);
      }
    };

    if (userId) {
      fetchMetaData();
      fetchFollowedState();
      setLoading(false);
    }
  }, [userId, loggedInUserId]);

  const handleFollowToggle = async () => {
    try {
      if (followed) {
        await api.delete(`/users/${userId}/follow`);
        const newMeta = { ...profileMeta };
        newMeta._count.followers--;
        setProfileMeta(newMeta);
      } else {
        await api.post(`/users/${userId}/follow`);
        const newMeta = { ...profileMeta };
        newMeta._count.followers++;
        setProfileMeta(newMeta);
      }
      setFollowed(!followed);
    } catch (error) {
      console.error('Error following/unfollowing user', error);
    }
  };

  if (loading) return <div className="text-center mt-8 text-gray-400">Loading...</div>;

  console.log(profileMeta);

  return (
    <>
      <div className="profile-page container mx-auto p-6 min-h-screen text-white">
        {/* Profile Header */}
        <div className="profile-header flex items-center justify-between mb-4">
          <div className='flex items-center space-x-4'>
            <img
              src={profileMeta.profilePictureUrl}
              alt={`${profileMeta.username}'s profile`}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">@{profileMeta.username}</h1>
              <p className="text-gray-400">{profileMeta.bio || 'No bio available'}</p>
            </div>
          </div>
        {userId === loggedInUserId ? (
            <>
              <button
                onClick={handleModalOpen}
                className="py-2 px-4 space-x-2 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                <FontAwesomeIcon icon={faUserPen} />
                <span>Edit Profile</span>
              </button>
              <EditProfileModal
                open={isModalOpen}
                handleModalClose={handleModalClose}
                user={profileMeta}
                userId={userId}
                setProfileMeta={setProfileMeta}
              />
            </>
          ) : (
            <button
              onClick={handleFollowToggle}
              className={`py-2 px-4 rounded font-semibold focus:outline-none transition-colors ${
                followed ? 'bg-gray-500 text-white' : 'bg-gray-800 text-white'
              }`}
            >
              {followed 
              ? 
              <div className='space-x-2'>
                <span>Following</span>
                <FontAwesomeIcon icon={faCheck} />
              </div>
              :
              <div className='space-x-2'>
                <span>Follow</span>
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
               }
            </button>
          )}
      </div>

        {/* Profile Stats */}
        <section className="profile-stats mb-4 flex items-center justify-center">
          <div className="flex items-center space-x-6 mx-3">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">{profileMeta._count?.posts || 0}</h2>
              <p className="text-gray-400">Posts</p>
            </div>
            <div
              className="text-center cursor-pointer"
              onClick={() => navigate(`/users/${userId}/followers`)}
            >
              <h2 className="text-lg font-semibold text-white">{profileMeta._count?.followers || 0}</h2>
              <p className="text-gray-400">Followers</p>
            </div>
            <div
              className="text-center cursor-pointer"
              onClick={() => navigate(`/users/${userId}/following`)}
            >
              <h2 className="text-lg font-semibold text-white">{profileMeta._count?.following || 0}</h2>
              <p className="text-gray-400">Following</p>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">{formatTimeNoSuffix(cakeDay)}</h2>
              <p className="text-gray-400">Member for</p>
            </div>
          </div>
        </section>

        <div className='border-t border-gray-700 my-6'></div>

        {/* Tabs for Posts, Liked, Commented, Drafts */}
        <section className="tabs mb-4 flex justify-between">
          <h1 className='text-3xl font-semibold'>Posts</h1>
          <div className="flex items-center justify-center space-x-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTab === 'user_posts'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTab('user_posts')}
            >
              Posts
            </button>
            <button
              className={`px-4 py-2 rounded transition-colors ${
                selectedTab === 'user_liked'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTab('user_liked')}
            >
              Liked
            </button>
            <button
              className={`px-4 py-2 rounded transition-colors ${
                selectedTab === 'user_commented'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTab('user_commented')}
            >
              Commented
            </button>
            {userId === loggedInUserId && (
              <button
                className={`px-4 py-2 rounded transition-colors ${
                  selectedTab === 'user_drafts'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedTab('user_drafts')}
              >
                Drafts
              </button>
            )}
          </div>
        </section>

        {/* Render PostsList Component */}
        <section>
          <PostsList sourceId={userId} type={selectedTab} />
        </section>
      </div>
    </>
  );
};

export default ProfilePage;
