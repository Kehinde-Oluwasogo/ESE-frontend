# Cloudinary Profile Picture Integration Guide

## Setup Instructions

### 1. Install Cloudinary Package
```bash
npm install cloudinary-react
```

### 2. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Get your **Cloud Name**, **API Key**, and **API Secret** from the dashboard

### 3. Add Environment Variables
Create or update `.env` file in `ese-frontend/moz-todo-react/`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Create Upload Preset in Cloudinary
1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Set **Signing Mode** to "Unsigned"
4. Name it (e.g., "ese_profile_pictures")
5. Configure folder: `profile_pictures`
6. Set allowed formats: jpg, png, webp
7. Save

## Usage Example

### Profile Picture Upload Component

```jsx
import { useState } from 'react';

function ProfilePictureUpload({ currentImageUrl, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || '/default-avatar.png');

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        // Save to your backend
        onUploadSuccess(data.secure_url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
      setPreview(currentImageUrl || '/default-avatar.png');
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
        <label className="profile-picture-upload">
          {uploading ? (
            <span>⏳</span>
          ) : (
            <span>📷</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

export default ProfilePictureUpload;
```

## Backend Integration

### Update User Model
Add profile picture field to your User model or create a UserProfile model:

**Django Model Example:**
```python
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"
```

### API Endpoint
Create an endpoint to update profile picture:

```python
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class UpdateProfilePictureView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        profile_picture_url = request.data.get('profile_picture')
        
        if not profile_picture_url:
            return Response({'error': 'No URL provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.profile_picture = profile_picture_url
        profile.save()
        
        return Response({
            'message': 'Profile picture updated successfully',
            'profile_picture': profile_picture_url
        }, status=status.HTTP_200_OK)
```

## CSS Classes Already Added

The following CSS classes are ready for use:
- `.profile-picture-container` - Centers the profile picture
- `.profile-picture-wrapper` - Wrapper with relative positioning
- `.profile-picture` - The actual img element (circular with border)
- `.profile-picture-upload` - Upload button overlay

## Features
- ✅ Fullscreen responsive design
- ✅ Modern gradient backgrounds
- ✅ Smooth animations
- ✅ Mobile-friendly
- ✅ Profile picture upload UI ready
- ✅ Cloudinary integration prepared

## Next Steps
1. Install cloudinary-react package
2. Set up Cloudinary account and get credentials
3. Add environment variables
4. Create upload preset
5. Integrate ProfilePictureUpload component into Register or Profile page
6. Update backend API to save profile picture URL
