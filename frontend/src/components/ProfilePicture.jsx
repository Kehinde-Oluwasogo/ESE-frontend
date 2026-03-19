import { useState } from "react";
import "./App.css";

const CLOUDINARY_UPLOAD_URL = (cloudName) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

function App() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Error</h1>
        <p>Cloudinary credentials not configured. Check .env file.</p>
      </div>
    );
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(CLOUDINARY_UPLOAD_URL(cloudName), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setImages([
        ...images,
        {
          url: data.secure_url,
          publicId: data.public_id,
          uploadedAt: new Date().toLocaleString(),
        },
      ]);
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (publicId, index) => {
    // Note: Deletion requires a signed request or server-side handling.
    // For now, just remove from local state (image remains on Cloudinary).
    setImages(images.filter((_, i) => i !== index));
    console.log(
      `Image ${publicId} removed from display (still on Cloudinary)`
    );
  };

  return (
    <div style={styles.container}>
      <h1>Cloudinary Image Upload</h1>

      <div style={styles.uploadBox}>
        <label htmlFor="file-input" style={styles.uploadLabel}>
          {uploading ? "Uploading..." : "Click to upload or drag files"}
        </label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.imageGrid}>
        {images.map((image, index) => (
          <div key={index} style={styles.imageCard}>
            <img src={image.url} alt="Uploaded" style={styles.image} />
            <p style={styles.timestamp}>{image.uploadedAt}</p>
            <button
              onClick={() => deleteImage(image.publicId, index)}
              style={styles.deleteBtn}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {images.length === 0 && !error && (
        <p style={styles.emptyMessage}>No images uploaded yet.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  uploadBox: {
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
    backgroundColor: "#f9f9f9",
  },
  uploadLabel: {
    fontSize: "16px",
    color: "#666",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  imageCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  timestamp: {
    padding: "10px",
    fontSize: "12px",
    color: "#888",
    margin: "0",
  },
  deleteBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    backgroundColor: "#ff6b6b",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
  },
  emptyMessage: {
    textAlign: "center",
    color: "#aaa",
    marginTop: "40px",
  },
};

export default App;