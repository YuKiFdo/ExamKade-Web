import JSZip from 'jszip';

type UnzipMessage = {
  action: 'UNZIP';
  fileArrayBuffer: ArrayBuffer;
};

type ZipFileItem = {
  arrayBuffer: ArrayBuffer;
  path: string;
};

type ZipMessage = {
  action: 'ZIP';
  files: ZipFileItem[];
};

type WorkerMessage = UnzipMessage | ZipMessage;

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { action } = e.data;

  if (action === 'UNZIP') {
    try {
      const { fileArrayBuffer } = e.data as UnzipMessage;
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(fileArrayBuffer);
      
      const entries = Object.entries(loadedZip.files).filter(
        ([relativePath, zipEntry]) => !zipEntry.dir && relativePath.toLowerCase().endsWith('.pdf')
      );
      
      const total = entries.length;
      (self as any).postMessage({ type: 'PROGRESS', current: 0, total });
      
      const extractedFiles: { arrayBuffer: ArrayBuffer; relativePath: string; name: string }[] = [];
      let current = 0;
      
      for (const [relativePath, zipEntry] of entries) {
        const blob = await zipEntry.async('blob');
        const arrayBuffer = await blob.arrayBuffer();
        const filename = relativePath.split('/').pop() || 'document.pdf';
        
        extractedFiles.push({
          arrayBuffer,
          relativePath,
          name: filename
        });
        
        current++;
        (self as any).postMessage({ type: 'PROGRESS', current, total });
      }
      
      const transferables = extractedFiles.map(f => f.arrayBuffer);
      (self as any).postMessage({ type: 'SUCCESS_UNZIP', files: extractedFiles }, transferables);
    } catch (err: any) {
      (self as any).postMessage({ type: 'ERROR', error: err.message || 'Failed to unzip' });
    }
  } else if (action === 'ZIP') {
    try {
      const { files } = e.data as ZipMessage;
      const zip = new JSZip();
      
      for (const file of files) {
        zip.file(file.path, file.arrayBuffer);
      }
      
      const blob = await zip.generateAsync(
        { 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        },
        (metadata) => {
          (self as any).postMessage({ type: 'PROGRESS_ZIP', percent: Math.round(metadata.percent) });
        }
      );
      
      const arrayBuffer = await blob.arrayBuffer();
      (self as any).postMessage({ type: 'SUCCESS_ZIP', arrayBuffer }, [arrayBuffer]);
    } catch (err: any) {
      (self as any).postMessage({ type: 'ERROR', error: err.message || 'Failed to zip' });
    }
  }
};
