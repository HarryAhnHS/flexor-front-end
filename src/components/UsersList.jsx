import UserPreview from './UserPreview';
import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const UsersList = ({ sourceId, scenario }) => {
  const [userIds, setUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Track the current page
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
  const limit = 10; // Number of posts per page

  const resetUsers = useCallback(() => {
    // Clear posts when sourceId or type changes
    setUserIds([]);
    setPage(1);
    setHasMore(true);
  }, []);

  useEffect(() => {
    console.log("UsersList: Reset useeffect running")
    resetUsers();
    
  }, [sourceId, scenario, resetUsers]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let response;
        switch (scenario) {
          case 'likedPost':
            response = await api.get(`/posts/${sourceId}/liked`, { params: { page, limit } });
            break;
          case 'likedComment':
            response = await api.get(`/comments/${sourceId}/liked`, { params: { page, limit } });
            break;
          case 'joinedRealm':
            response = await api.get(`/realms/${sourceId}/joiners`, { params: { page, limit } });
            break;
          case 'followers':
            response = await api.get(`/users/${sourceId}/followers`, { params: { page, limit } });
            break;
          case 'following':
            response = await api.get(`/users/${sourceId}/following`, { params: { page, limit } });
            break;
          default:
            response = { data: { users: [] } };
            break;
        }

        if (response.data.users.length < limit) {
          setHasMore(false); // No more users to load
        }

        setUserIds(prevUsers => [...prevUsers, ...response.data.users.map(user => user.id)]); // Append new users
      } 
      catch (error) {
        console.error('Error fetching users:', error);
      } 
      finally {
        setTimeout( async () => {
            setLoading(false);
          }, 1000)
      }
    };
    fetchUsers();
  }, [page, scenario, sourceId]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore && !loading) {
        setPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="user-list space-y-4">
      {userIds.length > 0 
      ?
      userIds.map((userId) => (
        <UserPreview 
          key={userId} 
          userId={userId} 
        />
      ))
      :
      !loading && <p className="text-gray-600 text-center mt-8">No users available.</p>
    }
      {loading && <p className="text-center text-gray-500">Loading more users...</p>}
    </div>
  );
};

export default UsersList;
