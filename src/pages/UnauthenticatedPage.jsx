import { Link } from 'react-router-dom';

const UnauthenticatedPage = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Welcome</h2>
      <p>Please <Link to="/login" className="text-blue-500">login</Link> or <Link to="/signup" className="text-blue-500">sign up</Link> to continue.</p>
    </div>
  );
};

export default UnauthenticatedPage;
