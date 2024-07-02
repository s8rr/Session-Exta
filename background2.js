chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ sessions: [] });
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveSession") {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const session = tabs.map(tab => ({
          url: tab.url,
          title: tab.title
        }));
        chrome.storage.sync.get("sessions", (data) => {
          const sessions = data.sessions || [];
          sessions.push(session);
          chrome.storage.sync.set({ sessions }, () => {
            sendResponse({ success: true });
          });
        });
      });
    } else if (request.action === "loadSession") {
      chrome.storage.sync.get("sessions", (data) => {
        const session = data.sessions[request.index];
        session.forEach(tab => {
          chrome.tabs.create({ url: tab.url });
        });
        sendResponse({ success: true });
      });
    } else if (request.action === "deleteSession") {
      chrome.storage.sync.get("sessions", (data) => {
        const sessions = data.sessions || [];
        sessions.splice(request.index, 1);
        chrome.storage.sync.set({ sessions }, () => {
          sendResponse({ success: true });
        });
      });
    } else if (request.action === "importSessions") {
      const importedSessions = request.sessions;
      chrome.storage.sync.get("sessions", (data) => {
        const sessions = data.sessions || [];
        importedSessions.forEach((session, index) => {
          session.name = `import${index + 1}`;
          sessions.push(session);
        });
        chrome.storage.sync.set({ sessions }, () => {
          sendResponse({ success: true });
        });
      });
    }
    return true; // Keeps the messaging channel open for sendResponse
  });
  
