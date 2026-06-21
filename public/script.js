const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let conversationHistory = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  conversationHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const loadingMsgId = "loading-" + Date.now();
  appendTypingIndicator(loadingMsgId);

  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history: conversationHistory }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Delay buatan acak antara 1 detik hingga 3 detik (1000ms - 3000ms)
      const typingDelay = Math.floor(Math.random() * 2000) + 1000;
      
      setTimeout(() => {
        const loadingEl = document.getElementById(loadingMsgId);
        if (loadingEl) loadingEl.remove();

        if (data.reply) {
          conversationHistory.push({
            role: "model",
            parts: [{ text: data.reply }],
          });
          appendMessage("bot", data.reply);
        } else if (data.error) {
          conversationHistory.pop();
          appendMessage("bot", "Waduh error nih: " + data.error);
        } else {
          conversationHistory.pop();
          appendMessage(
            "bot",
            "Pusing pala barbie, nggak ngerti lu ngomong apa.",
          );
        }
      }, typingDelay);
    })
    .catch((err) => {
      console.error(err);
      conversationHistory.pop();
      const loadingEl = document.getElementById(loadingMsgId);
      if (loadingEl) loadingEl.remove();
      appendMessage(
        "bot",
        "Servernya lagi ngambek (error). Pastiin backend nyala!",
      );
    });
});

function appendMessage(sender, text, id = null) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  if (id) {
    msg.id = id;
  }
  
  const textEl = document.createElement("div");
  textEl.textContent = text;
  msg.appendChild(textEl);

  // Tambahkan jam pengiriman
  const timeEl = document.createElement("div");
  timeEl.classList.add("message-time");
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  timeEl.textContent = `${hours}:${minutes}`;
  
  // Jangan tampilkan jam jika sedang loading
  if (text !== "...") {
    msg.appendChild(timeEl);
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTypingIndicator(id) {
  const msgWrapper = document.createElement("div");
  msgWrapper.classList.add("message", "bot");
  msgWrapper.id = id;

  const typingAnimation = document.createElement("div");
  typingAnimation.classList.add("typing-animation");
  typingAnimation.innerHTML = '<span></span><span></span><span></span>';
  
  msgWrapper.appendChild(typingAnimation);
  chatBox.appendChild(msgWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}
