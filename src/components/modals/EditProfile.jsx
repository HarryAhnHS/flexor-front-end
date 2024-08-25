import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const EditProfileModal = ({ open, handleClose, handleSubmit, user }) => {
    const [formData, setFormData] = useState({ username: '', bio: '' });
    const [usernameError, setUsernameError] = useState("");

    // Update formData when modal opens or currentUser changes
    useEffect(() => {
        if (open && user) {
            setFormData({
                username: user.username || '',
                bio: user.bio || '',
            });
            setUsernameError('');
        }
    }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        await handleSubmit(formData);
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
