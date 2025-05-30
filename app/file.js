const socket = io('http://localhost:8080');

const userList = document.getElementById('userList');
const input = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
let selectedUser = null;

// Receive and display user list
socket.on('userList', (users) => {
    userList.innerHTML = '';
    for (let id in users) {
        const li = document.createElement('li');
        li.textContent = id;
        li.onclick = () => {
            selectedUser = id;
            alert(`Selected ${id}+: tese=>`);
        };
        userList.appendChild(li);
    }
});

// Send message to selected user
sendBtn.addEventListener('click', () => {
    if (!selectedUser) {
        alert("Select a user to send message.");
        return;
    }
    const message = input.value;
    socket.emit('privateMessage', { to: selectedUser, message });
    input.value = '';
});

// Receive private messages
socket.on('privateMessage', ({ from, message }) => {
    const li = document.createElement('li');
    li.textContent = `Private from ${from}: ${message}`;
    let promise = fetch(url, [options])
    document.getElementById('messages').appendChild(li);
});
