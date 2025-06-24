const socket = io();

const clientsTotal = document.getElementById('clients-total');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageTone = new Audio('/message-tone.mp3');

let username = prompt("Enter your name:")?.trim() || "Anonymous";
socket.emit("user-joined", username);

let clientUserMap = {}; 
let receiverSocketId = null;

socket.on('client-total', (count) => {
  clientsTotal.innerText = `Total Clients: ${count}`;
});

socket.on('user-list', (userMap) => {
  clientUserMap = userMap;
  const userListContainer = document.getElementById('user-list');
  userListContainer.innerHTML = '';

  Object.entries(userMap).forEach(([socketId, name]) => {
    if (name === username) return; 

    const button = document.createElement('button');
    button.textContent = name;
    button.className = 'user-button';
    button.addEventListener('click', () => {
      receiverSocketId = socketId;
      addUser(userMap[receiverSocketId]);
    });
    userListContainer.appendChild(button);
  });
});

function addUser(username) {
  const userHTML = `
        <div class="name">
            <span>
                <i class="far fa-user"></i>
            </span>
            <input type="text" id="name-input" class="name-input" value="${username}" maxlength="20">
        </div>
    `;
  messageContainer.innerHTML += userHTML;
  const nameInput = document.getElementById('name-input');
  nameInput.addEventListener('change', () => {
    const newName = nameInput.value.trim();
    if (newName) {
      username = newName;
      socket.emit('user-joined', username);
    }
  });
}


messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  const messageText = messageInput.value.trim();
  if (messageText === '') return;
  if(receiverSocketId === null)
  {
    alert(`select user`);
    return;  
  }
  if (receiverSocketId) {
    socket.emit('private-message', {
      to: receiverSocketId,
      from: username,
      message: messageText
    });
    addMessageToUI(true, {
      name: `To ${clientUserMap[receiverSocketId]}`,
      message: messageText,
      dateTime: new Date()
    });
  } else {
    socket.emit('message', {
      name: username,
      message: messageText,
      dateTime: new Date()
    });
    addMessageToUI(true, {
      name: username,
      message: messageText,
      dateTime: new Date()
    });
  }
  messageInput.value = '';
}

socket.on('chat-message', (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

socket.on('private-message', (data) => {
  messageTone.play();
  addMessageToUI(false, {
    name: `From ${data.from}`,
    message: data.message,
    dateTime: data.dateTime
  });
});

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const messageHTML = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        <span>${data.name} • ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>
  `;
  messageContainer.innerHTML += messageHTML;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo({
    top: messageContainer.scrollHeight,
    behavior: 'smooth'
  });
}

function sendTypingFeedback() {
  socket.emit('feedback', {
    feedback: `✍️ ${username} is typing a message...`
  });
}

messageInput.addEventListener('focus', sendTypingFeedback);
messageInput.addEventListener('keypress', sendTypingFeedback);
messageInput.addEventListener('blur', () => {
  socket.emit('feedback', { feedback: '' });
});

socket.on('feedback', (data) => {
  clearFeedback();
  const feedbackHTML = `
    <li class="message-feedback">
      <p class="feedback" id="feedback">${data.feedback}</p>
    </li>
  `;
  messageContainer.innerHTML += feedbackHTML;
});

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((el) => el.remove());
} 