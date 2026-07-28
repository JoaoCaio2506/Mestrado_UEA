import { supabase } from './supabaseClient';

// Fire-and-forget: persistence is a nice-to-have side effect for the
// "Minhas Inferências" / "Usuários" tabs, never something the live
// diagnosis flow should wait on or break over.
export async function persistInference({ file, gradcamUrl, diag, pct, agentName }) {
  if (!supabase) return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Prefer storing the Grad-CAM heatmap — it's what "Minhas Inferências"
    // previews — falling back to the plain upload when Grad-CAM is off/failed.
    let uploadFile = file;
    if (gradcamUrl) {
      try {
        const blob = await (await fetch(gradcamUrl)).blob();
        uploadFile = new File([blob], file?.name || 'gradcam.png', { type: blob.type || 'image/png' });
      } catch {
        uploadFile = file;
      }
    }

    let imagePath = null;
    if (uploadFile) {
      const path = `${user.id}/${Date.now()}-${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage.from('inference-images').upload(path, uploadFile);
      if (!uploadError) imagePath = path;
    }

    await supabase.from('inferences').insert({
      user_id: user.id,
      file_name: file?.name || null,
      image_path: imagePath,
      diag,
      pct,
      agent_name: agentName || null,
    });
  } catch {
    // Swallow — see comment above.
  }
}
