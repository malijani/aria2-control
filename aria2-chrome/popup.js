const toggleBtn = document.getElementById('toggleStatus');
const dirInput = document.getElementById('downloadDir');

chrome.storage.local.get(['extensionEnabled', 'downloadFolder'], (data) => {
  if (data.extensionEnabled !== undefined) {
    updateToggleButton(data.extensionEnabled);
  }
  if (data.downloadFolder) {
    dirInput.value = data.downloadFolder;
  }
});

dirInput.addEventListener('input', () => {
  chrome.storage.local.set({ downloadFolder: dirInput.value });
});

toggleBtn.addEventListener('click', () => {
  const isEnabled = toggleBtn.classList.contains('enabled');
  const newState = !isEnabled;
  chrome.storage.local.set({ extensionEnabled: newState }, () => {
    updateToggleButton(newState);
  });
});

function updateToggleButton(enabled) {
  if (enabled) {
    toggleBtn.textContent = "ENABLED";
    toggleBtn.className = "toggle-btn enabled";
  } else {
    toggleBtn.textContent = "DISABLED";
    toggleBtn.className = "toggle-btn disabled";
  }
}
