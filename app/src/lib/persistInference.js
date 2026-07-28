import { supabase } from './supabaseClient';

// Fire-and-forget: persistence is a nice-to-have side effect for the
// "Minhas Inferências" / "Usuários" tabs, never something the live
// diagnosis flow should wait on or break over.
export async function persistInference({ file, diag, pct, agentName }) {
  if (!supabase) return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let imagePath = null;
    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('inference-images').upload(path, file);
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
