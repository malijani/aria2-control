// Init configuration
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ extensionEnabled: true, downloadFolder: "" });
  
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "download-with-aria2c",
      title: "Download with aria2c",
      contexts: ["link"]
    });
  });
});

// Recreate context menu based on enabled/disabled state
chrome.storage.onChanged.addListener((changes) => {
  if (changes.extensionEnabled) {
    recreateContextMenu();
  }
});

function recreateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.local.get('extensionEnabled', (data) => {
      if (data.extensionEnabled) {
        chrome.contextMenus.create({
          id: "download-with-aria2c",
          title: "Download with aria2c",
          contexts: ["link"]
        });
      }
    });
  });
}


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "download-with-aria2c") {
    sendToAria2(info.linkUrl);
  }
});

async function sendToAria2(url) {
  const settings = await chrome.storage.local.get(['downloadFolder']);
  const rpcUrl = "http://localhost:6800/jsonrpc";
  
  const params = [[url]];
  
  if (settings.downloadFolder && settings.downloadFolder.trim() !== "") {
    params.push({ dir: settings.downloadFolder.trim() });
  }

  const payload = {
    jsonrpc: "2.0",
    id: "chrome-extension",
    method: "aria2.addUri",
    params: params
  };

  try {
    await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Aria2 Background Daemon Connection Failed:", error);
  }
}
