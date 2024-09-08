import UsersList from '../components/UsersList';
import { useParams } from 'react-router-dom';

const Users = ({ scenario }) => {
  const { id } = useParams();

  return (
    <>
      <div className="user-listing-page container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">
            Users
        </h1>
        <section>
          <UsersList sourceId={id} scenario={scenario}/>
        </section>
      </div>
    </>
  );
};

export default Users;
