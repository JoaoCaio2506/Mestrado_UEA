import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import PatientImagesPanel from './components/PatientImagesPanel';
import AgentsPanel from './components/AgentsPanel';
import ChatBar from './components/ChatBar';
import { SAMPLE_ANALYZED_IMAGES } from './data/sampleImages';
import { buildDiagnosisResponse } from './data/diagnosisResponse';
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
  const [progressWidth, setProgressWidth] = useState('0%');
  const [progressDurationMs, setProgressDurationMs] = useState(0);

  const chatRef = useRef(null);
  const loadingTimerRef = useRef(null);
  const doneTimerRef = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(loadingTimerRef.current);
      clearTimeout(doneTimerRef.current);
    },
    [],
  );

  const handleSelectAgent = (agent) => {
    setSelectedAgentId(agent.id);
    chatRef.current?.mentionAgent(agent);
    setHasInteracted(true);
  };

  const handleFileSelected = (file) => {
    // Only safe to revoke the previous blob if it never made it into the
    // analyzed history — once classified, that list owns the URL instead.
    if (currentImage && !currentImage.result) revokeIfBlob(currentImage.url);
    const url = URL.createObjectURL(file);
    setCurrentImage({
      url,
      name: file.name,
      previewable: IMAGE_MIME_TYPES.includes(file.type),
    });
    setHasInteracted(true);
  };

  const handleSend = (text) => {
    if (loadingPhase !== 'idle' || !currentImage) return;

    setChatMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', text }]);

    const duration = 5000 + Math.random() * 5000;
    setLoadingPhase('loading');
    setProgressWidth('0%');
    setProgressDurationMs(duration);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgressWidth('100%'));
    });

    clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setLoadingPhase('done');
      clearTimeout(doneTimerRef.current);
      doneTimerRef.current = setTimeout(() => {
        // TODO: replace buildDiagnosisResponse with the real n8n webhook call
        // once it's available — same (agentId, image) in, { text, diag, pct } out.
        const { text: responseText, diag, pct } = buildDiagnosisResponse(selectedAgentId);
        const roundedPct = Math.round(pct);
        setAnalyzedImages((prev) => {
          const next = [
            {
              id: `analyzed-${Date.now()}`,
              diag,
              pct: roundedPct,
              src: currentImage.previewable ? currentImage.url : null,
              name: currentImage.name,
            },
            ...prev,
          ];
          // Only the 10 most recent analyses stay accessible, even via scroll.
          const kept = next.slice(0, MAX_HISTORY);
          next.slice(MAX_HISTORY).forEach((img) => revokeIfBlob(img.src));
          return kept;
        });
        setChatMessages((prev) => [
          ...prev,
          { id: `assistant-${Date.now()}`, role: 'assistant', text: responseText },
        ]);
        // The classified image stays in the featured slot with its result
        // badge instead of reverting to empty — the next upload replaces it.
        setCurrentImage((prev) => (prev ? { ...prev, result: { diag, pct: roundedPct } } : prev));
        chatRef.current?.clear();
        setLoadingPhase('idle');
        setProgressWidth('0%');
      }, 700);
    }, duration);
  };

  const handleClearChat = () => setChatMessages([]);

  const effectiveProgressDurationMs = progressWidth === '100%' ? progressDurationMs : 200;
  const progressLabel = loadingPhase === 'done' ? '100%' : 'Analisando…';

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
        progressWidth={progressWidth}
        progressDurationMs={effectiveProgressDurationMs}
        progressLabel={progressLabel}
        canSend={!!currentImage}
        onSend={handleSend}
        messages={chatMessages}
        onClearChat={handleClearChat}
      />
    </div>
  );
}
