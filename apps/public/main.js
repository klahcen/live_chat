const socket = io()

const clientsTotal = document.getElementById('clients-total')

const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageFrom = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

const maessgeTone = new Audio('/message-tone.mp3')

messageFrom.addEventListener('submit',(e)=>{
    e.preventDefault()
    sendMessage()
})

socket.on('client-total',(data)=>{
    clientsTotal.innerText = `Total Client: ${data}`
})

function sendMessage()
{
    if(messageInput.value==='')return
    // console.log(messageInput.value)
    const data ={
        name: nameInput.value,
        message: messageInput.value,
        dataTime: new Date()
    }
    socket.emit('message',data)
    addMessageToUI(true, data)
    messageInput.value = ''
}

socket.on('chat-message', (data) => {
    // console.log(data)
    maessgeTone.play()
    addMessageToUI(false,data)
})

function addMessageToUI(isownMessage, data)
{
    clearFeedback()
    const element = `
         <li class="${isownMessage ? 'message-right' :  'message-left'}">
                <p class="message">
                    ${data.message}
                    <span>
                        ${data.name} ${moment(data.dataTime).fromNow()}
                    </span>
                </p>
            </li>
       `
    messageContainer.innerHTML += element
    scrollToBottom()
}


function scrollToBottom(){
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

messageInput.addEventListener('focus', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  })
})

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  })
})
messageInput.addEventListener('blur', (e) => {
  socket.emit('feedback', {
    feedback: '',
  })
})

socket.on('feedback', (data) => {
  clearFeedback()
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `
  messageContainer.innerHTML += element
})

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element)
  })
}