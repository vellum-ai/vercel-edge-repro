document.addEventListener('mousedown', (event) => {
  const target = event.target;
  const section = target.closest('.im-c-content');
  if (!section) return;
  const html = section.innerHTML;
  chrome.runtime.sendMessage({
    action: 'elementCaptured',
    elementDetails: { html },
  });
});
