import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import api from '../utils/api';
import AvatarCropper from './AvatarCropper';
import styles from './ImageInput.module.css';

interface Props {
  value: string;
  onChange: (url: string) => void;
  round?: boolean;
  crop?: boolean;
}

export interface ImageInputHandle {
  receiveFile: (file: File) => void;
}

const ImageInput = forwardRef<ImageInputHandle, Props>(function ImageInput(
  { value, onChange, round, crop },
  ref
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const uploadFile = async (file: File | Blob, filename = 'image.jpg') => {
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file, filename);
      const { data } = await api.post('/api/upload', formData);
      onChange(data.url);
    } catch {
      setError('Upload failed — try a smaller image (max 8MB) or jpeg/png/gif/webp.');
    } finally {
      setUploading(false);
    }
  };

  const receiveFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.');
      return;
    }
    if (crop) {
      setPendingImage(URL.createObjectURL(file));
    } else {
      uploadFile(file, file.name);
    }
  };

  useImperativeHandle(ref, () => ({ receiveFile }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    receiveFile(file);
  };

  const closeCropper = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage);
    setPendingImage(null);
  };

  const handleCropped = (blob: Blob) => {
    closeCropper();
    uploadFile(blob);
  };

  return (
    <div className={styles.wrap}>
      {value && (
        <img src={value} alt="" className={round ? styles.previewRound : styles.preview} />
      )}
      <div className={styles.controls}>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Image or GIF URL, or upload a file"
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {value && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        hidden
        onChange={handleFile}
      />
      {error && <p className="text-error">{error}</p>}
      {pendingImage && (
        <AvatarCropper image={pendingImage} onCancel={closeCropper} onCropped={handleCropped} />
      )}
    </div>
  );
});

export default ImageInput;
