import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faFloppyDisk, faImages, faXmark, faSmile } from '@fortawesome/free-solid-svg-icons';
import GiphyModal from '../components/modals/GiphyModal';

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
  const [publishError, setPublishError] = useState(null);
  const [realmError, setRealmError] = useState(null);
  const [isGifModalOpen, setGifModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);


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
          setPostImages(response.data.post.images.map((image) => ({
            ...image,
            url: image.url,
            isUploaded: true,
          })));
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
      setFormData({
        realmId: '',
        title: '',
        text: '',
        published: false,
      });
      setSelectedRealm(null);
      setPostImages([]);
    }
  }, [isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const id = uuidv4();
    const reader = new FileReader();

    reader.onloadend = () => {
      setPostImages([
        ...postImages,
        {
          id,
          url: reader.result,
          file,
        },
      ]);
    };

    reader.readAsDataURL(file);
  };

  const handleGifSelect = (gif) => {
    const gifData = {
      id: uuidv4(),
      url: gif.images.original.url,
      isGif: true,
    };
    setPostImages([...postImages, gifData]);
    setGifModalOpen(false);
  };

  const handleImageDelete = async (image) => {
    try {
      setPostImages(postImages.filter((i) => i.id !== image.id));
      if (image.isUploaded) {
        let deleteIds = image.id;
        let deletePublicIds = null;

        if (image.publicId) {
          deletePublicIds = image.publicId;
        }
        // If has publicId (user uploaded not gif then delete public Ids too)
        const queryString = new URLSearchParams({
          deleteIds: deleteIds,
          deletePublicIds: deletePublicIds,
        }).toString();

        await api.delete(`/images?${queryString}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setPostImages([...postImages, image]);
    }
  };

  const handleSubmit = async (e, published) => {
    e.preventDefault();

    if (published && (!formData.title || !formData.realmId)) {
      setPublishError('Title and Realm are required to publish the post.');
      return;
    }

    setLoading(true); // Set loading state to true
    console.log(postImages);
    console.log(postImages.filter((image) => image.file));
    console.log(postImages.filter((image) => image.isGif));
    try {
      // Upload new files if any
      await Promise.all(
        postImages
          .filter((image) => image.file)
          .map(async (image) => {
            const uploadData = new FormData();
            uploadData.append('image', image.file);
            uploadData.append('id', image.id);

            await api.post(`/images/`, uploadData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          })
      );

      // Upload new gif images if any
      await Promise.all(
        postImages
          .filter((image) => image.isGif)
          .map( async (gif) => {
            await api.post('/images/existing', {id: gif.id, url: gif.url});
         })
      );

      const formDataToSend = {
        ...formData,
        published,
        imageIds: postImages.map((image) => image.id),
      };

      if (isEditing) {
        await api.put(`/posts/${postId}`, formDataToSend);
      } else {
        await api.post(`/posts/`, formDataToSend);
      }

      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
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
            <div className='flex items-center space-x-4 text-sm'>
              {/* Image Upload Button */}
              <div className='my-4'>
                <label
                  htmlFor="images"
                  className="flex items-center space-x-2 px-3 py-2 h-full text-xs sm:text-sm text-gray-100 bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
                > 
                  <FontAwesomeIcon icon={faImages} className="mr-1" />
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
              
              {/* Giphy Upload Button */}
              <div className="my-4">
                <button
                  type="button"
                  onClick={() => setGifModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm text-gray-100 bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faSmile} className="mr-1"/>
                  <span>Search for a GIF</span>
                </button>
              </div>
            </div>


            {/* Giphy Search Modal */}
            <GiphyModal
              isOpen={isGifModalOpen}
              onClose={() => setGifModalOpen(false)}
              onGifSelect={handleGifSelect}
            />
          </div>

          <div className='border-t border-gray-700 my-6'></div>

          <div className="flex space-x-4 text-xs sm:text-sm">
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
    )}
    </div>
  );
};

export default PostForm;
