import UserPreview from './UserPreview';

const UsersList = ({ userIds }) => {
  return (
    <div className="user-list space-y-4">
      {userIds.map((userId) => (
        <UserPreview 
          key={userId} 
          userId={userId} 
        />
      ))}
    </div>
  );
};

export default UsersList;
