import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import UsersList from '../components/UsersList';
import { useParams } from 'react-router-dom';

const Users = ({ scenario }) => {
  const [userIds, setUserIds] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response;
        switch (scenario) {
          case 'likedPost':
            response = await api.get(`/posts/${id}/liked`);
            break;
          case 'likedComment':
            response = await api.get(`/comments/${id}/liked`);
            break;
          case 'joinedRealm':
            response = await api.get(`/realms/${id}/joiners`);
            break;
          case 'followers':
            response = await api.get(`/users/${id}/followers`);
            break;
          case 'following':
            response = await api.get(`/users/${id}/following`);
            break;
          default:
            response = { data: { users: [] } };
            break;
        }
        setUserIds(response.data.users.map(user => user.id));
      } 
      catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [scenario, id]);

  console.log(userIds);

  return (
    <>
      <Navbar />
      <div className="user-listing-page container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">{`Users ${scenario.replace(/([A-Z])/g, ' $1').toLowerCase()}`}</h1>
        <UsersList userIds={userIds} />
      </div>
    </>
  );
};

export default Users;
