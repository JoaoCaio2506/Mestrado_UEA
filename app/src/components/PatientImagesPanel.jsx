import FeaturedImage from './FeaturedImage';
import AnalyzedSidePanel from './AnalyzedSidePanel';
import UploadDropzone from './UploadDropzone';
import './PatientImagesPanel.css';

export default function PatientImagesPanel({
  currentImage,
  isAnalyzing,
  analyzedImages,
  onFileSelected,
  uploadGlowing,
}) {
  return (
    <div className="patient-panel">
      <div className="section-title patient-title">Imagens do paciente</div>

      <div className="images-row">
        <FeaturedImage image={currentImage} isAnalyzing={isAnalyzing} />
        <AnalyzedSidePanel images={analyzedImages} />
      </div>

      <div className="upload-row">
        <UploadDropzone onFileSelected={onFileSelected} glowing={uploadGlowing} />
      </div>
    </div>
  );
}
