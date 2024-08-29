import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Button, CircularProgress } from '@mui/material';

const NewRealmPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [realmPictureFile, setRealmPictureFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [loading, setLoading] = useState(false);

    const [nameError, setNameError] = useState("");
    const [fileError, setFileError] = useState("");

    useEffect(() => {
        setNameError('');
        setFileError('');
        // Set preview as default image
        setImagePreview("https://res.cloudinary.com/dr8iz6zig/image/upload/v1724372280/default_nwzykb.png");
    }, []);
    
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
            const response = await api.post('/realms', formData);
            const realmId = response.data.realm.id;
            if (realmPictureFile) {
                const pictureData = new FormData();
                pictureData.append('realmPicture', realmPictureFile);
                
                await api.put(`/images/${realmId}/realm-picture`, pictureData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            // Redirect to profile
            if (response.status === 201) {
                window.location.href = '/profile';
            }
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


    return ( 
    <>
        <Navbar />
        <div className="p-6 text-xl font-bold text-center">
            <h1>Create a new realm</h1>
        </div>
        {loading 
            ?
            <div className="flex justify-center mt-4">
                <CircularProgress /> {/* MUI loading spinner */}
            </div>
            :
            <div className='p-6'>
                <form onSubmit={handleSubmit}>
                    {imagePreview && (
                        <div className="mt-4 flex justify-center">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-64 h-48 object-cover"
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
                        <label htmlFor="profilePicture">
                            <Button variant="outlined" component="span" color="primary" className="w-full">
                                Upload Realm Picture
                            </Button>
                            { fileError && 
                                <p className='text-center text-red-600'>{fileError}</p>
                            }
                        </label>
                    <div className="mb-4">
                        <label htmlFor="name" className="block">Realm Name:</label>
                        <input
                            id="name"
                            type="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            required
                        />
                        { nameError && 
                            <p className='text-center text-red-600'>{nameError}</p>
                        }
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block">Add a description:</label>
                        <textarea
                            id="description"
                            type="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white p-2">Create realm</button>
                </form>
            </div>
            }
        
    </>
    );
};

export default NewRealmPage;
