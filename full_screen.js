// Fetch and display the title and message
chrome.storage.local.get(['modalTitle', 'modalMessage'], (data) => {
  document.getElementById('modalTitle').textContent = data.modalTitle || 'Notification';
  document.getElementById('modalMessage').textContent = data.modalMessage || '';
  const audio = document.getElementById('notificationSound');
  audio.play().catch(error => {
    console.error('Error playing sound:', error);
  });
});
