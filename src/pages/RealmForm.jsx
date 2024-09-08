import { useEffect, useState } from 'react';
import api from '../services/api';
import { CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

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
          // Reset form data when navigating to New Post page
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
        <>
            <div className="p-8 bg-gray-100 min-h-screen">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">{realmId ? 'Edit Realm' : 'Create a New Realm'}</h2>
                    {loading ? (
                        <div className="flex justify-center">
                            <CircularProgress />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                                    Realm Picture (optional):
                                </label>
                                {imagePreview && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-64 h-48 object-cover rounded-md shadow-md"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="profilePicture"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label htmlFor="profilePicture" className="inline-block p-2 mt-2 text-sm text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                                    Upload Realm Picture
                                </label>
                                {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Realm Name:
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {nameError && <p className="text-red-500 text-sm mt-2">{nameError}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description:
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="5"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="w-1/3 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {isEditing ? 'Update Realm' : 'Create Realm'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-1/3 py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-md shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default RealmForm;
