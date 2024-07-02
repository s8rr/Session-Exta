document.getElementById("save").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "saveSession" }, (response) => {
      if (response.success) {
        loadSessions();
      }
    });
  });
  
  document.getElementById("export").addEventListener("click", () => {
    chrome.storage.sync.get("sessions", (data) => {
      const sessions = data.sessions || [];
      const code = btoa(JSON.stringify(sessions));
      const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "sessions.txt";
      link.click();
    });
  });
  
  document.getElementById("import").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const code = e.target.result;
        const importedSessions = JSON.parse(atob(code));
        chrome.runtime.sendMessage({ action: "importSessions", sessions: importedSessions }, (response) => {
          if (response.success) {
            loadSessions();
          }
        });
      };
      reader.readAsText(file);
    };
    input.click();
  });
  
  function loadSessions() {
    chrome.storage.sync.get("sessions", (data) => {
      const sessions = data.sessions || [];
      const sessionsDiv = document.getElementById("sessions");
      sessionsDiv.innerHTML = "";
      sessions.forEach((session, index) => {
        const sessionDiv = document.createElement("div");
        sessionDiv.textContent = `Session ${index + 1} - ${session.name || 'Unnamed'}`;
        sessionDiv.classList.add("session-item");
        sessionDiv.addEventListener("click", () => {
          chrome.runtime.sendMessage({ action: "loadSession", index }, (response) => {
            if (response.success) {
              window.close();
            }
          });
        });
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", (e) => {
          e.stopPropagation();
          chrome.runtime.sendMessage({ action: "deleteSession", index }, (response) => {
            if (response.success) {
              loadSessions();
            }
          });
        });
        sessionDiv.appendChild(deleteButton);
        sessionsDiv.appendChild(sessionDiv);
      });
    });
  }
  
  loadSessions();
  