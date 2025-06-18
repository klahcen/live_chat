const socket = io()

const clinetsTotal = document.getElementById('clinets-total')

socket.on('clinet-total',(data)=>{
    clinetsTotal.innerText = `Total Client: ${data}`
})