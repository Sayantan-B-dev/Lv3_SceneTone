import {
  handleAnalysisRequest,
  type AnalysisWorkerRequest,
  type AnalysisWorkerResponse,
} from './analysis-worker-handler';

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<AnalysisWorkerRequest>) => void) | null;
  postMessage: (message: AnalysisWorkerResponse) => void;
};

workerScope.onmessage = (event) => {
  handleAnalysisRequest(event.data, (message) => workerScope.postMessage(message));
};
