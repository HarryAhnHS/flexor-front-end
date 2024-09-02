import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';

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
      navigate(`/profile/${userId}`);

    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${userId}`);
  };

  return (
    <>
      <Navbar />
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">{isEditing ? (formData.published ? 'Edit Post' : 'Edit Draft') : 'Create Post'}</h2>
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title:
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="realm" className="block text-sm font-medium text-gray-700">
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
                className="mt-1"
              />
              {realmError && <p className="text-red-500 text-sm mt-2">{realmError}</p>}
            </div>
            <div className="mb-4">
              <label
                htmlFor="images"
                className="inline-block p-2 text-sm text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                Upload Images
              </label>
              <input
                type="file"
                id="images"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {fileError && <p className="text-center text-red-600">{fileError}</p>}
              <div className="mt-4 flex flex-wrap">
                {postImages &&
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
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs focus:outline-none"
                      >
                        x
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                Content:
              </label>
              <textarea
                id="text"
                name="text"
                value={formData.text || ''}
                onChange={handleInputChange}
                rows="5"
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="w-1/3 py-2 px-4 bg-gray-600 text-white font-semibold rounded-md shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="w-1/3 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isEditing ? (formData.published ? 'Save Changes' : 'Publish Draft') : "Publish Post"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/3 py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-md shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
            {publishError && <p className="text-red-500 text-sm mt-2">{publishError}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default PostForm;
