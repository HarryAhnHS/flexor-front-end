import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import Select from 'react-select';

const NewPostPage = () => {
  const [postId, setPostId] = useState(null);
  const [formData, setFormData] = useState({
    realmId: '',
    title: '',
    text: '',
    published: false,
  });
  const [userRealms, setUserRealms] = useState([]);
  const [realmError, setRealmError] = useState(null);

  const [postImages, setPostImages] = useState([]);

  const [publishError, setPublishError] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    async function initializePost() {
      try {
        const response = await api.post('/posts/');
        setPostId(response.data.post.id);
        setFormData({ ...formData });
      } catch (error) {
        console.error('Error initializing post:', error);
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const response = await api.post(`/images/${postId}`, uploadData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
      const imageUrl = response.data.imageUrl;
      setPostImages([...postImages, imageUrl]);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e, published) => {
    e.preventDefault();

    if (published && (!formData.title || !formData.realmId)) {
      setPublishError('Title and Realm are required to publish the post.');
      return;
    }

    try {
      const response = await api.put(`/posts/${postId}`, {
        ...formData,
        published,
      });
      if (response.status === 200) {
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await api.delete(`/posts/${postId}`);
      window.location.href = '/profile';
    } catch (error) {
      console.error('Error canceling post:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Create Post</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title:
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
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
                name="realmId"
                options={userRealms.map((realm) => ({
                  value: realm.id,
                  label: realm.name,
                }))}
                onChange={(selectedOption) =>
                  setFormData({ ...formData, realmId: selectedOption.value })
                }
                className="mt-1"
              />
              {realmError && <p className="text-red-500 text-sm mt-2">{realmError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Upload Images:
              </label>
              <input
                type="file"
                id="images"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <div className="mt-4 flex flex-wrap">
                {postImages &&
                  postImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Uploaded ${index}`}
                      className="w-24 h-24 object-cover rounded-lg mr-4 mb-4"
                    />
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
                value={formData.text}
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
                className="w-1/3 py-2 px-4 bg-gray-600 text-white font-semibold rounded-md shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Save as Draft
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="w-1/3 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Publish Post
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/3 py-2 px-4 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
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

export default NewPostPage;
