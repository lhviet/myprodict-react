import moment from 'moment';

export function downloadRecordingAudio(audioBlob: Blob) {
  const timestamp: string = moment().format('HHmm-DDMMYYYY');
  const audioUrl: string = URL.createObjectURL(audioBlob);
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = `ra-${timestamp}.mp3`;
  a.click();
  window.URL.revokeObjectURL(audioUrl);
}