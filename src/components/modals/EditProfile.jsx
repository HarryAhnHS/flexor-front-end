import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const EditProfileModal = ({ open, handleModalClose, user, userId, setProfileMeta }) => {
  const [formData, setFormData] = useState({ username: '', bio: '' });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (open && user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
      });
      setUsernameError('');
      setFileError('');
      setImagePreview(user.profilePictureUrl);
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePictureFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (profilePictureFile) {
        const pictureData = new FormData();
        pictureData.append('profilePicture', profilePictureFile);
        await api.put('/images/profile-picture', pictureData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      const response = await api.put(`/users/${userId}`, formData);
      setProfileMeta(response.data.user);
      handleModalClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.error === 'Username is already taken') {
        setUsernameError(error.response.data.error);
      }
      if (error.response?.data?.message === 'Invalid file type') {
        setFileError('Invalid file type - only png, jpeg, gif, webp, svg, bmp allowed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null; // Don't render the modal if not open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-2xl mb-4">Update Your Profile</h2>
        <div className='border-t border-gray-700 my-6'></div>
        <form onSubmit={handleFormSubmit}>
          {loading ? (
            <div className="flex justify-center mt-4">
              <div className="loader border-t-4 border-indigo-500 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="relative mt-4 flex flex-col items-center justify-center">
                <div className='mb-1'>Change Profile Photo</div>
                <input
                  type="file"
                  accept="image/*"
                  id="profilePicture"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="profilePicture" className="relative cursor-pointer w-32 h-32">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-700"
                    />
                  )}
                  <div className="w-32 h-32 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faUpload} />
                  </div>
                </label>
                {fileError && <p className="text-center text-red-500 mt-2">{fileError}</p>}
              </div>
              <div className="mt-4">
                <label htmlFor='username'>Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full p-2 rounded bg-gray-800 border-2 ${
                    usernameError ? 'border-red-500' : 'border-gray-700'
                  } text-white`}
                />
                {usernameError && <p className="text-red-500">{usernameError}</p>}
              </div>
              <div className="mt-4">
                <label htmlFor='bio'>Bio&nbsp;<span className='text-sm'>(optional)</span></label>
                <textarea
                  id="bio"
                  placeholder="Bio (optional)"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-800 border-2 border-gray-700 text-white"
                ></textarea>
              </div>
            </>
          )}
        </form>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleModalClose}
            className="mr-2 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleFormSubmit}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
