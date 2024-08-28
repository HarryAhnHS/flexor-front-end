import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import api from '../../services/api';

const EditProfileModal = ({ open, handleModalClose, user, userId, setProfileMeta }) => {
    const [formData, setFormData] = useState({ username: '', bio: '' });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [loading, setLoading] = useState(false);

    const [usernameError, setUsernameError] = useState("");
    const [fileError, setFileError] = useState("");

    // Update formData when modal opens or currentUser changes
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
      // Conditionally update profile picture
      if (profilePictureFile) {
        const pictureData = new FormData();
        pictureData.append('profilePicture', profilePictureFile);
        await api.put('/images/profile-picture', pictureData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
      }
      const response  = await api.put(`/users/${userId}`, formData);
      setProfileMeta(response.data.user);
      handleModalClose(); 
    } 
    catch (error) {
      console.error('Error submitting form:', error);
      if (error.response.data.error === "Username is already taken") {
        setUsernameError(error.response.data.error);
      }
      if (error.response.data.message === "Invalid file type") {
        setFileError("Invalid file type - only png, jpeg, gif, webp, svg, bmp allowed");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleModalClose}>
      <DialogTitle>Update Your Profile</DialogTitle>
      <DialogContent>
        <form onSubmit={handleFormSubmit}>
          {loading 
            ? 
              <div className="flex justify-center mt-4">
                  <CircularProgress /> {/* MUI loading spinner */}
              </div>
            :
              <>
                {imagePreview && (
                    <div className="mt-4 flex justify-center">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-24 h-24 rounded-full object-cover"
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
                        Upload Profile Picture
                    </Button>
                    { fileError && 
                      <p className='text-center text-red-600'>{fileError}</p>
                    }
                </label>
                <TextField
                  autoFocus
                  margin="dense"
                  name="username"
                  label="Username"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!usernameError}
                  helperText={usernameError}
                />
                <TextField
                  margin="dense"
                  name="bio"
                  label="Bio (optional)"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                />
              </>
          }
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose} color="primary">
          Cancel
        </Button>
        <Button type="submit" onClick={handleFormSubmit} color="primary">
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
