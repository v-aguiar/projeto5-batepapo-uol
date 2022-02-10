let username = '';

const user = {
  stayLoggedInterval: 0,

  sendUserName() {
    const name = prompt("Qual o seu lindo nome?")
    username = name

    const request = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", {name: name})
    request.then(this.keepUserLoggedIn)
    request.catch(this.userAlreadyLoggedIn)
  },

  userAlreadyLoggedIn(error) {
    alert("User already logged in, please enter different name!")

    this.sendUserName()
  },

  keepUserLoggedIn(response) {
    this.stayLoggedInterval = setInterval(() => {
      const request = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name: username})
      request.then(() => {
        console.log("still logged")
      })
    }, 4500)
  },

  getAllLoggedInUsers() {
    const request = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
    // request.then(user.isUserInRoom)
  }
}

const chat = {
  getMessages() {
    const request = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages")

    request.then(this.populateChat)
  },

  populateChat(response) {
    const messagesContainer = document.querySelector(".messages")
    messagesContainer.innerHTML = ''

    response.data.forEach((message) => {
      const messageStructure = chat.buildMessageStructure(message)
      const messageDiv = document.createElement('div')

      if(message.type === 'private_message') {
        if((username === message.from) || (username === message.to)) {
          messageDiv.classList.add("message", `--${message.type}`)
          messageDiv.innerHTML = messageStructure
          messagesContainer.appendChild(messageDiv)
          messageDiv.scrollIntoView()
        }
      } else {
        messageDiv.classList.add("message", `--${message.type}`)
        messageDiv.innerHTML = messageStructure
        messagesContainer.appendChild(messageDiv)
        messageDiv.scrollIntoView()
      }
    })
  },

  buildMessageStructure(message) {
    const ifPrivateMessage = message.type === 'private_message' ? 'reservadamente' : ''
    const ifPublicMessage = message.type === 'message' ? `${ifPrivateMessage} para <strong> ${message.to}:</strong>` : ''

    const structure = `
        <p>
          <time class="time">${message.time}</time>
          <span class="who"><strong>${message.from}</strong> ${ifPublicMessage}</span>
          ${message.text}
        </p>
      `

    return structure
  },

  sendMessage() {
    const text = document.querySelector("footer textarea")

    const messageData = {
      from: username,
      to: "Todos",
      text: `${text.value}`,
      type: "message"
    }
    const validateSentMessage = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", messageData)

    text.value = ''

    validateSentMessage.then(chat.getMessages)
    validateSentMessage.catch(() => {window.location.reload()})
  }
}

// Declarations

setInterval(() => {chat.getMessages()}, 3000)
user.sendUserName()
