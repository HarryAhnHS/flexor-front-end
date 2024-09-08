import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCheck } from '@fortawesome/free-solid-svg-icons';

const UserPreview = ({ userId }) => {
  const [followed, setFollowed] = useState(null);
  const [user, setUser] = useState(null);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data.user);
      } 
      catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const fetchFollowedState = async () => {
      try {
        const response = await api.get(`/users/${loggedInUserId}/following`);
        const users = response.data.users.map(user => user.id);
        setFollowed(users.includes(userId));
      } 
      catch (error) {
        console.error('Error fetching followed users:', error);
      }
    };

    fetchUser();
    fetchFollowedState();
  }, [loggedInUserId, userId]);

  const handleFollowToggle = async () => {
    try {
      if (followed) {
        await api.delete(`/users/${userId}/follow`);
        setUser(prev => ({
          ...prev,
          _count: { ...prev._count, followers: prev._count.followers - 1 }
        }));
      } else {
        await api.post(`/users/${userId}/follow`);
        setUser(prev => ({
          ...prev,
          _count: { ...prev._count, followers: prev._count.followers + 1 }
        }));
      }
      setFollowed(!followed);
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };

  return (
    <div 
      className="relative cursor-pointer" 
      onClick={() => navigate(`/profile/${userId}`)}
    >
      <div 
        className="user-preview flex items-center justify-between space-x-4 p-4 bg-gray-800 rounded-lg"
      >
        <div 
          className="user-info flex items-center gap-3"
          onMouseEnter={() => setHovered(true)} 
          onMouseLeave={() => setHovered(false)}
        >
          <img 
            src={user?.profilePictureUrl} 
            alt={`${user?.username}'s profile`} 
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
          />
          <h2 className="text-xl text-white hover:underline">@{user?.username}</h2>
        </div>
        {userId !== loggedInUserId && 
            <button 
            onClick={(e) => {
                e.stopPropagation(); // Prevent navigating to the profile page when clicking follow/unfollow
                handleFollowToggle();
            }} 
            className={`py-2 px-4 rounded-md font-semibold flex items-center ${followed ? 'bg-gray-700 text-white' : 'bg-indigo-600 text-white'}`}
            >
            <FontAwesomeIcon 
              icon={followed ? faCheck : faUserPlus} 
              className="mr-2"
            />
            {followed ? 'Following' : 'Follow'}
            </button>
        }
      </div>

      {/* Hover Card with Additional User Details */}
      {hovered && (
        <div className="absolute z-10 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg mt-2 w-64">
          <div className="flex items-center space-x-4">
            <img 
              src={user?.profilePictureUrl} 
              alt={`${user?.username}'s profile`} 
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
            />
            <div className="flex flex-col text-white">
              <h2 className="text-lg font-semibold">{user?.username}</h2>
              <p className="text-gray-400">Joined: {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-4 text-gray-300">
            <p>Posts: {user?._count.posts}</p>
            <p>Followers: {user?._count.followers}</p>
            <p>Following: {user?._count.following}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPreview;
