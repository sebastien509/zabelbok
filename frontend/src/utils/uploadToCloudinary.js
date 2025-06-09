// ✅ utils/uploadToCloudinary.js
export async function uploadToCloudinary(file, folder = 'edu-platform') {
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dyeomcmin/auto/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'edu_platform'; // 🔒 must be created on your Cloudinary dashboard
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
  
    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
  
      if (!data.secure_url) throw new Error('Upload failed');
      return data.secure_url;
    } catch (err) {
      console.error('[Cloudinary Upload Error]', err);
      throw err;
    }
  }
  