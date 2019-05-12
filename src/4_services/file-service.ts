import moment from 'moment';

export function downloadRecordingAudio(audioBlob: Blob, percent?: number, order?: number) {
  const orderTitle = order ? `-${order}` : '';
  const percentTitle = percent ? `-${percent}` : '';
  const timestamp: string = moment().format('HHmm-DDMMYYYY');
  const audioUrl: string = URL.createObjectURL(audioBlob);
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = `ra${orderTitle}${percentTitle}-${timestamp}.mp3`;
  a.click();
  window.URL.revokeObjectURL(audioUrl);
}