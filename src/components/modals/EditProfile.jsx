import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const EditProfileModal = ({ open, handleClose, handleSubmit, user }) => {
    const [formData, setFormData] = useState({ username: '', bio: '' });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [usernameError, setUsernameError] = useState("");


    // Update formData when modal opens or currentUser changes
    useEffect(() => {
        if (open && user) {
            setFormData({
                username: user.username || '',
                bio: user.bio || '',
            });
            setUsernameError('');
            setImagePreview(user.profilePictureUrl);
        }
    }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    try {
        await handleSubmit(formData, profilePictureFile);
        handleClose();
    }
    catch(error) {
        // Set username error if it exists in the error response
        if (error.response.data.error === "Username is already taken") {
            setUsernameError(error.response.data.error);
        }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Update Your Profile</DialogTitle>
      <DialogContent>
        <form onSubmit={handleFormSubmit}>
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
              id="profile-picture-input"
              onChange={handleFileChange}
              className="hidden"
          />
          <label htmlFor="profile-picture-input">
              <Button variant="outlined" component="span" color="primary" className="w-full">
                  Upload Profile Picture
              </Button>
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
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
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
