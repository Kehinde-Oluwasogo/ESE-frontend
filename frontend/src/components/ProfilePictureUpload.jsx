import { useState } from 'react';
import { buildApiUrl } from "../utils/api";

function ProfilePictureUpload({ currentImageUrl, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || 'https://via.placeholder.com/120/667eea/ffffff?text=Upload');
  const [error, setError] = useState('');

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'profile_pictures');

    try {
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();
      
      if (cloudinaryData.secure_url) {
        // Save to backend
        const token = localStorage.getItem('access_token');
        
        const backendResponse = await fetch(buildApiUrl("/auth/profile/picture/"), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_picture: cloudinaryData.secure_url }),
        });

        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          onUploadSuccess(cloudinaryData.secure_url);
        } else {
          throw new Error('Failed to save profile picture');
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload image. Please try again.');
      setPreview(currentImageUrl || 'https://via.placeholder.com/120/667eea/ffffff?text=Upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-picture-container">
      <div className="profile-picture-wrapper">
        <img 
          src={preview} 
          alt="Profile" 
          className="profile-picture"
        />
        <label className="profile-picture-upload" title="Upload profile picture">
          {uploading ? (
            <span style={{ fontSize: '18px' }}>⏳</span>
          ) : (
            <span style={{ fontSize: '18px', color: 'white' }}>📷</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
      {error && (
        <p style={{ 
          color: '#c33', 
          fontSize: '1.2rem', 
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          {error}
        </p>
      )}
      {uploading && (
        <p style={{ 
          color: '#667eea', 
          fontSize: '1.3rem', 
          marginTop: '0.5rem',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          Uploading...
        </p>
      )}
    </div>
  );
}

export default ProfilePictureUpload;
