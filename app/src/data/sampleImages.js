import tuberculosisSample from '../assets/images/tuberculosis-sample.png';
import normalSample from '../assets/images/normal-sample.png';

// Example "already analyzed" entries shown before the user runs any real
// inference, so the feature is legible on first load.
export const SAMPLE_ANALYZED_IMAGES = [
  { id: 'sample-1', diag: 'tb', pct: 75, agentName: 'Yolo26', src: tuberculosisSample },
  { id: 'sample-2', diag: 'normal', pct: 92, agentName: 'ConvNext', src: normalSample },
  { id: 'sample-3', diag: 'tb', pct: 68, agentName: 'Consenso Geral', src: tuberculosisSample },
];
