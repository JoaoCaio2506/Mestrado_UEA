import { useRef, useState } from 'react';
import './UploadDropzone.css';

export default function UploadDropzone({ onFileSelected, glowing }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    const file = files && files[0];
    if (file) onFileSelected(file);
  };

  return (
    <div
      className={`upload-dropzone ${glowing ? 'glowing' : ''} ${dragOver ? 'drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.dcm,image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <i className="ti ti-upload upload-icon" />
      <div className="upload-hint mono">Faça o Upload Aqui (JPG · PNG · DICOM)</div>
    </div>
  );
}
