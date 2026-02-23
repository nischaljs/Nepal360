import api from './api';

export const exportDonationsCSV = async () => {
  const { data } = await api.get('/export/donations', {
    responseType: 'blob',
  });

  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'donations-export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
