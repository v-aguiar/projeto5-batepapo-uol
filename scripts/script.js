const enterRoom = {
  stayLoggedInterval: 0,

  sendUserName() {
    const name = prompt("Qual o seu lindo nome?")

    const request = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", {name: name})
    request.then(this.keepUserLoggedIn)
    request.catch(this.userAlreadyLoggedIn)
  },

  userAlreadyLoggedIn(error) {
    alert("User already logged in, please enter different name!")

    this.sendUserName()
  },

  keepUserLoggedIn(response) {

    // console.log(response)

    // this.stayLoggedInterval = setInterval(() => {
    //   const req = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name: this.name})
    //   req.then((response) => {
    //     console.log("still logged")
    //   })
    // }, 4500)
  }
}

const chat = {
  getMessages() {
    const request = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages")
    request.then(this.populateChat)
  },

  populateChat(response) {
    response.data.forEach((message) => {

      console.log(message)

      const ifPrivateMessage = message.type === 'private_message' ? 'reservadamente' : ''
      const ifPublicMessage = message.type === 'message' ? `${ifPrivateMessage} para <strong> ${message.to}:</strong>` : ''

      const messageStructure = `
        <p>
          <time class="time">${message.time}</time>
          <span class="who"><strong>${message.from}</strong> ${ifPublicMessage}</span>
          ${message.text}
        </p>
      `

      const messagesContainer = document.querySelector(".messages")
      const messageDiv = document.createElement('div')

      messageDiv.classList.add("message", `--${message.type}`)
      messageDiv.innerHTML = messageStructure
      messagesContainer.appendChild(messageDiv)
      messageDiv.scrollIntoView()
    })

  }
}

// Declarations

chat.getMessages()
enterRoom.sendUserName()
