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
      finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMetaData();
      fetchFollowedState();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
          <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
      </div>
  )}

  return (
    <>
      <div className="profile-page container mx-auto p-6 min-h-screen text-white">
        {/* Loading Indicator */}
        {/* Profile Header */}
        <div className="profile-header flex flex-col sm:flex-row items-center sm:items-start sm:justify-between mb-4">
          <div className='flex flex-col sm:flex-row items-center sm:items-start space-x-0 sm:space-x-4'>
            <img
              src={profileMeta.profilePictureUrl}
              alt={`${profileMeta.username}'s profile`}
              className="w-24 h-24 rounded-full object-cover mb-4 sm:mb-0"
            />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-white">@{profileMeta.username}</h1>
              <div className='max-w-3/4'>
                <p className="text-gray-400 mt-2 overflow-wrap-break-word break-all">
                  {profileMeta.bio || 'No bio available'}
                </p>
              </div>
            </div>
          </div>
  
          <div className="mt-4 sm:mt-0">
            {userId === loggedInUserId ? (
              <>
                <button
                  onClick={handleModalOpen}
                  className="min-w-[120px] mx-2 py-2 px-4 space-x-2 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faUserPen} />
                  <span>Edit</span>
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
                  followed ? 'bg-gray-500 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                {followed ? (
                  <div className='flex items-center space-x-2'>
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Following</span>
                  </div>
                ) : (
                  <div className='flex items-center space-x-2'>
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span>Follow</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
  
        {/* Profile Stats */}
        <section className="profile-stats mb-4">
          <div className="flex items-center justify-center text-xs sm:text-sm space-x-4 sm:space-x-6 md:space-x-12 mx-3 my-6">
            <div className="text-center">
              <h2 className="text-base sm:text-lg font-semibold text-white">{profileMeta._count?.posts || 0}</h2>
              <p className="text-gray-400">Posts</p>
            </div>
            <div
              className="text-center cursor-pointer"
              onClick={() => navigate(`/users/${userId}/followers`)}
            >
              <h2 className="text-base sm:text-lg font-semibold text-white">{profileMeta._count?.followers || 0}</h2>
              <p className="text-gray-400">Followers</p>
            </div>
            <div
              className="text-center cursor-pointer"
              onClick={() => navigate(`/users/${userId}/following`)}
            >
              <h2 className="text-base sm:text-lg font-semibold text-white">{profileMeta._count?.following || 0}</h2>
              <p className="text-gray-400">Following</p>
            </div>
            <div className="text-center">
              <h2 className="text-base sm:text-lg font-semibold text-white">{formatTimeNoSuffix(cakeDay)}</h2>
              <p className="text-gray-400">Member for</p>
            </div>
          </div>
        </section>
  
        <div className='border-t border-gray-700 my-6'></div>
  
        {/* Tabs */}
        <section className="mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <h1 className='text-3xl font-bold'>
              {selectedTab === 'user_posts' ? 'Posts' : selectedTab === 'user_liked' ? 'Liked' : selectedTab === 'user_commented' ? 'Commented' : selectedTab === 'user_drafts' ? 'Drafts' : null}
            </h1>
            <div className="text-sm sm:text-base flex flex-wrap sm:flex-nowrap mt-4 sm:mt-0 space-x-4">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${selectedTab === 'user_posts' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
                onClick={() => setSelectedTab('user_posts')}
              >
                Posts
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${selectedTab === 'user_liked' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
                onClick={() => setSelectedTab('user_liked')}
              >
                Liked
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${selectedTab === 'user_commented' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
                onClick={() => setSelectedTab('user_commented')}
              >
                Commented
              </button>
              {userId === loggedInUserId && (
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${selectedTab === 'user_drafts' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
                  onClick={() => setSelectedTab('user_drafts')}
                >
                  Drafts
                </button>
              )}
            </div>
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
