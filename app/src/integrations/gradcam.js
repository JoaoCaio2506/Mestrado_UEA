export const GRADCAM_URL = import.meta.env.VITE_GRADCAM_URL || '';

// Calls the Grad-CAM API with the same uploaded file and returns an object
// URL for the resulting heatmap PNG. Callers should fall back to the
// original image on failure — this is a visual enhancement, not something
// the diagnosis flow depends on.
export async function callGradCam({ imageFile, signal }) {
  if (!GRADCAM_URL) {
    throw new Error('VITE_GRADCAM_URL não configurada.');
  }

  const formData = new FormData();
  formData.append('file', imageFile, imageFile.name);

  const response = await fetch(GRADCAM_URL, {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Grad-CAM API respondeu ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
