import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faFloppyDisk, faImages, faXmark } from '@fortawesome/free-solid-svg-icons';

const PostForm = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [formData, setFormData] = useState({
    realmId: '',
    title: '',
    text: '',
    published: false,
  });
  const [selectedRealm, setSelectedRealm] = useState(null);
  const [userRealms, setUserRealms] = useState([]);
  const [postImages, setPostImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [publishError, setPublishError] = useState(null);
  const [realmError, setRealmError] = useState(null);
  const [fileError, setFileError] = useState(null);

  const userId = localStorage.getItem('userId');
  const isEditing = !!postId;

  useEffect(() => {
    async function initializePost() {
      if (isEditing) {
        try {
          const response = await api.get(`/posts/${postId}`);
          const postData = {
            realmId: response.data.post.realm.id,
            title: response.data.post.title,
            text: response.data.post.text,
            published: response.data.post.published,
          };
          setFormData(postData);
          setSelectedRealm({
            value: response.data.post.realm.id,
            label: response.data.post.realm.name,
          });
          setPostImages(response.data.post.images);
        } catch (error) {
          console.error('Error initializing post:', error);
        }
      }
    }

    async function getUserJoinedRealms() {
      try {
        const realms = await api.get(`/users/${userId}/joined`);
        setUserRealms(realms.data.realms);
        if (realms.data.realms.length === 0) {
          setRealmError('Join a realm to post');
        }
      } catch (error) {
        console.error("Error fetching user's joined realms:", error);
        setRealmError('Failed to load realms');
      }
    }

    initializePost();
    getUserJoinedRealms();
  }, [userId, postId, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      // Reset form data when navigating to New Post page
      setFormData({
        realmId: '',
        title: '',
        text: '',
        published: false,
      });
      setSelectedRealm(null);
      setPostImages([]);
      setRemovedImages([]);
    }
  }, [isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async (e) => {
    const id = uuidv4();
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('id', id);
    try {
      const response = await api.post(`/images/`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPostImages([...postImages, response.data.image]);
    } catch (error) {
      if (error.response.data.message === 'Invalid file type') {
        setFileError('Invalid file type - only png, jpeg and gif allowed');
      }
    }
  };

  const handleImageDelete = async (image) => {
    setPostImages(postImages.filter((i) => i.id !== image.id));
    setRemovedImages([...removedImages, image]);
  };

  const handleSubmit = async (e, published) => {
    e.preventDefault();

    if (published && (!formData.title || !formData.realmId)) {
      setPublishError('Title and Realm are required to publish the post.');
      return;
    }

    try {
      if (isEditing) {
        // Update the post
        await api.put(`/posts/${postId}`, {
          ...formData,
          published,
          imageIds: postImages.map((image) => image.id),
        });
      } else {
        // Create a new post
        await api.post(`/posts/`, {
          ...formData,
          published,
          imageIds: postImages.map((image) => image.id),
        });
      }

      // Delete removed images if any using query
      if (removedImages.length > 0) {
        const deleteIds = removedImages.map((image) => image.id).join(',');
        const deletePublicIds = removedImages.map((image) => image.publicId).join(',');
        await api.delete(`/images?deleteIds=${deleteIds}&deletePublicIds=${deletePublicIds}`);
      }
      navigate(-1);

    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">{isEditing ? (formData.published ? 'Edit Post' : 'Edit Draft') : 'Create Post'}</h2>
        <div className='border-t border-gray-700 my-6'></div>
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="mb-4">
            <label htmlFor="realm" className="block text-sm font-medium text-gray-300">
              Choose a realm to post under:
            </label>
            <Select
              value={selectedRealm}
              name="realmId"
              options={userRealms.map((realm) => ({
                value: realm.id,
                label: realm.name,
              }))}
              onChange={(selectedOption) => {
                setFormData({ ...formData, realmId: selectedOption.value });
                setSelectedRealm(selectedOption);
              }}
              isSearchable={true}
              className="mt-1 cursor-pointer"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#4a5568',
                  borderColor: '#718096',
                  borderRadius: '0.375rem',
                  boxShadow: 'none',
                  color: '#ffffff',
                  ":hover": {
                    borderColor: "#718096",
                  },
                  ":focus, :active": {
                    borderColor: "#667eea",
                  },
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#4a5568',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#2d3748' : '#4a5568',
                  color: '#ffffff',
                  cursor: 'pointer',
                  ":hover": {
                    backgroundColor: "#2d3748",
                  },
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#ffffff', // Ensure selected value text color is white
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#a0a0a0', // Optional: placeholder text color
                }),
                input: (provided) => ({
                  ...provided,
                  color: '#ffffff', // Input text color
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  display: 'none', // Remove indicator separator
                }),
                dropdownIndicator: (provided) => ({
                  ...provided,
                  color: '#ffffff', // Dropdown indicator color
                  ':hover': {
                    color: '#ffffff', // Dropdown indicator hover color
                  },
                }),
                clearIndicator: (provided) => ({
                  ...provided,
                  color: '#ffffff', // Clear indicator color
                  ':hover': {
                    color: '#ffffff', // Clear indicator hover color
                  },
                }),
              }}
            />
            {realmError && <p className="text-red-500 text-sm mt-2">{realmError}</p>}
          </div>    
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              Title:
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            {postImages.length > 0 &&
                <div className="block text-sm font-medium text-gray-300">
                  Images:
                </div>}
            <div className="mt-2 flex flex-wrap">
              {postImages.length > 0 && 
                postImages.map((image) => (
                  <div key={image.id} className="relative w-24 h-24 mr-4 mb-4">
                    <img
                      src={image.url}
                      alt={`Uploaded ${image.id}`}
                      className="object-cover w-full h-full rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageDelete(image)}
                      className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-gray-800 opacity-80 text-white rounded-full p-1 text-sm focus:outline-none"
                    >
                      x
                    </button>
                  </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-300">
              Content:
            </label>
            <textarea
              id="text"
              name="text"
              value={formData.text || ''}
              onChange={handleInputChange}
              rows="5"
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div className='my-4'>
              <label
                htmlFor="images"
                className="space-x-2 p-2 text-sm text-gray-100 bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
              > 
                <FontAwesomeIcon icon={faImages} className="ml-2" />
                <span>Upload images</span>
              </label>
              <input
                type="file"
                id="images"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {fileError && <p className="text-center text-red-500">{fileError}</p>}
          </div>

          <div className='border-t border-gray-700 my-6'></div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="w-1/3 py-2 px-4 bg-gray-600 text-gray-200 font-semibold rounded-md shadow flex items-center justify-center space-x-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
              <span>Save as Draft</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="w-1/3 py-2 px-4 bg-indigo-600 text-gray-200 font-semibold rounded-md shadow flex items-center justify-center space-x-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? (formData.published 
                ? 
                  <>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                    <span>Save Changes</span>
                  </>
                : 
                  <>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                    <span>Publish Draft</span>
                  </>
                ) 
                : 
                  <>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                    <span>Publish</span>
                  </>
                }
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-1/3 py-2 px-4 bg-gray-500 text-gray-200 font-semibold rounded-md shadow flex items-center justify-center space-x-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <FontAwesomeIcon icon={faXmark} />
              <span>Cancel</span>
            </button>
          </div>
          {publishError && <p className="text-red-500 text-sm mt-2">{publishError}</p>}
        </form>
      </div>
    </div>
  );
};

export default PostForm;
