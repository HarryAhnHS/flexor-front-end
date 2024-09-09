import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [loggedUser, setLoggedUser] = useState({});
  const [suggestedRealms, setSuggestedRealms] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const take = 3;

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setLoggedUser(response.data.user);
      } catch (error) {
        console.error('Error fetching profile meta', error);
      }
    };

    const fetchSuggestedData = async () => {
      try {
        const response = await api.get(`/users/${userId}/suggest`, { params: { take } });
        setSuggestedUsers(response.data.users);
        setSuggestedRealms(response.data.realms);
      } 
      catch (error) {
        console.error('Error fetching suggested details', error);
      }
    };

    fetchMetaData();
    fetchSuggestedData();
  }, [userId]);

  const handleUserNavigate = (e, id) => {
    e.stopPropagation();
    navigate(`/profile/${id}`);
  };

  const handleRealmNavigate = (e, id) => {
    e.stopPropagation();
    navigate(`/realms/${id}`);
  };

  return (
    <nav className='bg-gray-900 text-white flex flex-col h-full py-6 px-4 border-l border-gray-700'>
      {/* Logged User Profile Container */}
      <div 
        className="flex items-center space-x-4 mb-8 cursor-pointer" 
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <img 
          src={loggedUser?.profilePictureUrl} 
          alt={`${loggedUser?.username}'s profile`} 
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
        />
        <h2 className="text-lg font-semibold hover:underline">@{loggedUser?.username}</h2>
      </div>

      {/* Suggested Users */}
      <div className='mb-4 font-bold text-gray-300'>Suggested for you</div>
      <div className='mb-2'>
        <h3 className='text-sm text-gray-300 font-semibold mb-2'>Users</h3>
        {suggestedUsers.map((user) => (
          <div 
            key={user.id} 
            className="flex items-center justify-between p-2 mb-2 rounded-lg hover:bg-gray-800 hover:shadow-md transition-all cursor-pointer group"
            onClick={(e) => handleUserNavigate(e, user.id)}
          >
            <div className="flex items-center gap-4">
              <img 
                src={user?.profilePictureUrl} 
                alt={`${user?.username}'s profile`} 
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
              />
              <div>
                <h4 className="text-md font-medium hover:underline">@{user?.username}</h4>
                <p className="text-xs text-gray-400 truncate max-w-xs">{user?.bio}</p>
              </div>
            </div>
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>

      {/* Suggested Realms */}
      <div className='mb-2'>
        <h3 className='text-sm text-gray-300 font-semibold mb-2'>Realms</h3>
        {suggestedRealms.map((realm) => (
          <div 
            key={realm.id} 
            className="flex items-center justify-between p-2 mb-2 rounded-lg hover:bg-gray-800 hover:shadow-md transition-all cursor-pointer group"
            onClick={(e) => handleRealmNavigate(e, realm.id)}
          >
            <div className="flex items-center gap-4">
              <img 
                src={realm?.realmPictureUrl} 
                alt={`${realm?.name} realm`} 
                className="w-10 h-10 rounded-lg object-cover border-2 border-gray-600"
              />
              <div>
                <h4 className="text-md font-medium hover:underline">{realm?.name}</h4>
                <p className="text-xs text-gray-400 truncate max-w-xs">{realm?.description}</p>
              </div>
            </div>
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto text-xs text-gray-500">
        Developed by HarryAhnHS
      </div>
    </nav>
  );
};

export default Sidebar;
