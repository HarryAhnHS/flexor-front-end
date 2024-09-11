import { useState } from 'react';
import Login from '../components/Login';
import SignUp from '../components/SignUp';

const UnauthenticatedPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
  };

  return (
    <div className="bg-gray-900 flex justify-center items-center w-screen min-h-screen py-6">
      <div className="flex flex-col md:flex-row items-center justify-center text-white max-w-[800px] w-full">
        {/* Welcome Section */}
        <div className="flex-1 p-4 md:p-8 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to <span className="text-indigo-400">Flex</span>or
          </h2>
        </div>

        {/* Form Section */}
        <div className="w-[90%] md:w-96 bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg md:mt-0">
          {/* Conditional Form Rendering */}
          {isLogin ? (
            <>
              <Login />
              <div className='mx-6 border-t border-gray-700'></div>
              <button
                onClick={toggleForm}
                className="w-full flex items-center justify-center text-gray-400 hover:underline mt-4"
              >
                Don&#39;t have an account? Sign Up
              </button>
            </>
          ) : (
            <>
              <SignUp />
              <div className='mx-6 border-t border-gray-700'></div>
              <button
                onClick={toggleForm}
                className="w-full flex items-center justify-center text-gray-400 hover:underline mt-4"
              >
                Already have an account? Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthenticatedPage;
