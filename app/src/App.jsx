import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import PatientImagesPanel from './components/PatientImagesPanel';
import AgentsPanel from './components/AgentsPanel';
import ChatBar from './components/ChatBar';
import { SAMPLE_ANALYZED_IMAGES } from './data/sampleImages';
import { buildDiagnosisResponse } from './data/diagnosisResponse';
import { callN8n, N8N_WEBHOOK_URL } from './integrations/n8n';
import { callGradCam, GRADCAM_URL } from './integrations/gradcam';
import { persistInference } from './lib/persistInference';
import './App.css';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];
const MAX_HISTORY = 10;

function revokeIfBlob(url) {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

export default function App() {
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [analyzedImages, setAnalyzedImages] = useState(SAMPLE_ANALYZED_IMAGES);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingPhase, setLoadingPhase] = useState('idle');
  const [progressPct, setProgressPct] = useState(0);

  const chatRef = useRef(null);
  const loadingTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const sessionIdRef = useRef(null);
  if (!sessionIdRef.current) sessionIdRef.current = crypto.randomUUID();

  useEffect(() => {
    // StrictMode's dev-only mount→unmount→remount cycle would otherwise
    // leave mountedRef stuck at false after the simulated remount, since
    // only the cleanup ran below — so it has to be reset on setup too.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(loadingTimerRef.current);
      clearInterval(progressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Run the bundled sample thumbnails through Grad-CAM too, so the
    // history panel isn't the only place showing plain X-rays on first
    // load. Each one swaps in independently as its call resolves; any
    // failure just leaves that sample as the plain image.
    if (!GRADCAM_URL) return;
    let cancelled = false;
    SAMPLE_ANALYZED_IMAGES.forEach((sample) => {
      (async () => {
        try {
          const response = await fetch(sample.src);
          const blob = await response.blob();
          const file = new File([blob], `${sample.id}.png`, { type: blob.type || 'image/png' });
          const gradcamUrl = await callGradCam({ imageFile: file });
          if (cancelled) return;
          setAnalyzedImages((prev) =>
            prev.map((img) => (img.id === sample.id ? { ...img, src: gradcamUrl } : img)),
          );
        } catch {
          // Keep the plain sample image on failure.
        }
      })();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectAgent = (agent) => {
    setSelectedAgentId(agent.id);
    chatRef.current?.mentionAgent(agent);
    setHasInteracted(true);
  };

  // Pushes a classified image's current result into "já analisadas". Used
  // both when a new upload replaces the featured image, and when the same
  // image is re-sent against a different agent — either way, whatever was
  // showing in the featured slot is about to be replaced, so it belongs in
  // history now instead of being silently lost.
  const archiveCurrentImage = (image) => {
    const { diag, pct, agentName } = image.result;
    setAnalyzedImages((prev) => {
      const next = [
        {
          id: `analyzed-${Date.now()}`,
          diag,
          pct,
          agentName,
          src: image.previewable ? image.url : null,
          name: image.name,
        },
        ...prev,
      ];
      // Only the 10 most recent analyses stay accessible, even via scroll.
      const kept = next.slice(0, MAX_HISTORY);
      next.slice(MAX_HISTORY).forEach((img) => revokeIfBlob(img.src));
      return kept;
    });
  };

  const handleFileSelected = (file) => {
    if (currentImage) {
      if (currentImage.result) {
        archiveCurrentImage(currentImage);
      } else {
        // Never classified — nothing else owns this URL, safe to revoke.
        revokeIfBlob(currentImage.url);
      }
    }
    const url = URL.createObjectURL(file);
    setCurrentImage({
      url,
      file,
      name: file.name,
      previewable: IMAGE_MIME_TYPES.includes(file.type),
    });
    setHasInteracted(true);
  };

  const handleSend = async (text) => {
    if (loadingPhase !== 'idle' || !currentImage) return;

    setChatMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', text }]);

    const duration = 5000 + Math.random() * 5000;
    setLoadingPhase('loading');
    setProgressPct(0);

    // The percentage climbs toward the cosmetic duration but is capped at
    // 99% — it only reaches 100% once the real n8n response has arrived,
    // so the number never lies about the reply actually being ready.
    const startTime = Date.now();
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgressPct(Math.min(99, Math.floor((elapsed / duration) * 99)));
    }, 100);

    const cosmeticDelay = new Promise((resolve) => {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(resolve, duration);
    });

    // Real n8n call and the cosmetic progress-bar fill run side by side —
    // whichever takes longer decides when we reveal the result, so the bar
    // never lies about being finished before the network actually is.
    const resultPromise = N8N_WEBHOOK_URL
      ? callN8n({
          text,
          imageFile: currentImage.file,
          sessionId: sessionIdRef.current,
          agentId: selectedAgentId,
        }).then(
          (value) => ({ ok: true, value }),
          (error) => ({ ok: false, error }),
        )
      : Promise.resolve({ ok: true, value: buildDiagnosisResponse(selectedAgentId) });

    // Grad-CAM runs alongside the diagnosis call — it's a visual extra, so a
    // failure here just falls back to the plain uploaded image instead of
    // blocking or erroring out the whole result.
    const gradcamPromise =
      GRADCAM_URL && currentImage.previewable
        ? callGradCam({ imageFile: currentImage.file }).then(
            (url) => ({ ok: true, url }),
            () => ({ ok: false }),
          )
        : Promise.resolve({ ok: false });

    const [, outcome, gradcamOutcome] = await Promise.all([cosmeticDelay, resultPromise, gradcamPromise]);
    clearInterval(progressTimerRef.current);
    if (!mountedRef.current) return;

    setLoadingPhase('done');
    setProgressPct(100);
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (!mountedRef.current) return;

    if (outcome.ok) {
      const { text: responseText, diag, pct, agentName } = outcome.value;
      const roundedPct = Math.round(pct);
      // Prefer the Grad-CAM heatmap once it's ready; otherwise fall back to
      // the plain uploaded image (same as before this feature existed).
      const gradcamUrl = gradcamOutcome.ok ? gradcamOutcome.url : null;
      persistInference({ file: currentImage.file, gradcamUrl, diag, pct: roundedPct, agentName });
      const displaySrc = gradcamUrl || (currentImage.previewable ? currentImage.url : null);

      if (currentImage.result) {
        // Same image, another round (e.g. a different agent this time) —
        // the previous result is about to be replaced in the featured
        // slot, so it belongs in history now, not lost.
        archiveCurrentImage(currentImage);
      } else if (gradcamUrl) {
        // First classification for this image — nothing else references
        // the plain uploaded blob once the Grad-CAM heatmap replaces it.
        revokeIfBlob(currentImage.url);
      }

      setChatMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: responseText },
      ]);
      // The classified image stays in the featured slot with its result
      // badge instead of reverting to empty — it only moves into the
      // "já analisadas" history once replaced, either by the next upload
      // (see handleFileSelected) or by another round on this same image.
      // Swapping the src to the Grad-CAM image happens in this same update,
      // so it only ever appears alongside the chat reply, never before it.
      setCurrentImage((prev) =>
        prev ? { ...prev, url: displaySrc || prev.url, result: { diag, pct: roundedPct, agentName } } : prev,
      );
    } else {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'error',
          text: `Não foi possível obter o diagnóstico do n8n: ${outcome.error.message}`,
        },
      ]);
    }

    chatRef.current?.clear();
    setLoadingPhase('idle');
    setProgressPct(0);
    setSelectedAgentId(null);
  };

  const handleClearChat = () => setChatMessages([]);

  return (
    <div className="dashboard">
      <div className="main-row">
        <div className="left-col">
          <Header />
          <PatientImagesPanel
            currentImage={currentImage}
            isAnalyzing={loadingPhase === 'loading' || loadingPhase === 'done'}
            analyzedImages={analyzedImages}
            onFileSelected={handleFileSelected}
            uploadGlowing={!hasInteracted}
          />
        </div>

        <AgentsPanel selectedAgentId={selectedAgentId} onSelectAgent={handleSelectAgent} />
      </div>

      <ChatBar
        ref={chatRef}
        hasInteracted={hasInteracted}
        onInteract={() => setHasInteracted(true)}
        loadingPhase={loadingPhase}
        progressPct={progressPct}
        canSend={!!currentImage}
        onSend={handleSend}
        messages={chatMessages}
        onClearChat={handleClearChat}
      />
    </div>
  );
}
