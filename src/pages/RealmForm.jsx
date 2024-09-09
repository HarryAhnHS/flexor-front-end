import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faImages, faLayerGroup, faXmark } from '@fortawesome/free-solid-svg-icons';

const RealmForm = () => {
    const navigate = useNavigate();
    const { realmId } = useParams(); // Get realmId from route parameters
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [realmPictureFile, setRealmPictureFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState("");
    const [fileError, setFileError] = useState("");

    const userId = localStorage.getItem('userId');

    const isEditing = !!realmId;

    useEffect(() => {
        // Reset errors on component mount
        setNameError('');
        setFileError('');

        const fetchRealmData = async () => {
            if (isEditing) {
                setLoading(true);
                try {
                    const response = await api.get(`/realms/${realmId}`);
                    const realmData = response.data.realm;
                    setFormData({
                        name: realmData.name,
                        description: realmData.description,
                    });
                    if (realmData.realmPictureUrl) {
                        setImagePreview(realmData.realmPictureUrl);
                    }
                } catch (error) {
                    console.error('Error fetching realm data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRealmData();
    }, [realmId, isEditing]);

    useEffect(() => {
        if (!isEditing) {
          // Reset form data when navigating to New Realm page
          setFormData({
            name: "",
            description: "",
          });
          setRealmPictureFile(null);
          setImagePreview(null);
        }
      }, [isEditing]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setRealmPictureFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                // Update existing realm
                await api.put(`/realms/${realmId}`, formData);
                if (realmPictureFile) {
                    const pictureData = new FormData();
                    pictureData.append('realmPicture', realmPictureFile);
                    
                    await api.put(`/images/${realmId}/realm-picture`, pictureData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }
            } else {
                // Create new realm
                const response = await api.post('/realms', formData);
                const newRealmId = response.data.realm.id;
                if (realmPictureFile) {
                    const pictureData = new FormData();
                    pictureData.append('realmPicture', realmPictureFile);
                    
                    await api.put(`/images/${newRealmId}/realm-picture`, pictureData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }
            }
            navigate(`/profile/${userId}`);
        }
        catch(error) {
            console.error('Error submitting form:', error);
            if (error.response.data.error === "Realm name is already taken") {
              setNameError(error.response.data.error);
            }
            if (error.response.data.message === "Invalid file type") {
              setFileError("Invalid file type - only png, jpeg, and gif allowed");
            }
        }
        finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
      };

    return ( 
        <div className="bg-gray-900 min-h-screen p-6">
            <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    {realmId ? 'Edit Realm' : 'Create a New Realm'}
                </h2>

                <div className='border-t border-gray-700 my-6'></div>

                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="file"
                                accept="image/*"
                                id="profilePicture"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="profilePicture"
                                className="space-x-2 my-4 p-2 text-sm text-gray-100 bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
                            > 
                                <FontAwesomeIcon icon={faImages} className="ml-2" />
                                <span>Realm Picture <span className='text-sm text-gray-500'>(Optional)</span></span>
                            </label>
                            {imagePreview && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-64 h-48 object-cover rounded-lg"
                                        />
                                    </div>
                            )}
                            {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                Realm Name:
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {nameError && <p className="text-red-500 text-sm mt-2">{nameError}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                                Description:
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div className='border-t border-gray-700 my-6'></div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="w-1/2 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow flex items-center justify-center space-x-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {isEditing 
                                ? 
                                <>
                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                    <span>Save Changes</span>
                                </> 
                                : 
                                <>
                                    <FontAwesomeIcon icon={faLayerGroup} />
                                    <span>Create Realm</span>
                                </> 
                                }
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-1/2 py-2 px-4 bg-gray-500 text-gray-200 font-semibold rounded-md shadow flex items-center justify-center space-x-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                <FontAwesomeIcon icon={faXmark} />
                                <span>Cancel</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RealmForm;
