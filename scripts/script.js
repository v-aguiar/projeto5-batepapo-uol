const enterRoom = {
  currentUser: username = '',
  stayLoggedInterval: 0,

  sendUserName() {
    const name = prompt("Qual o seu lindo nome?")
    this.currentUser = name;
    console.log(this.currentUser)

    const request = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", {name: name})
    request.then(this.keepUserLoggedIn)
    request.catch(this.userAlreadyLoggedIn)
  },

  userAlreadyLoggedIn(error) {
    alert("User already logged in, please enter different name!")

    this.sendUserName()
  },

  keepUserLoggedIn(response) {

    console.log(this.currentUser)

    this.stayLoggedInterval = setInterval(() => {
      const req = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name: this.currentUser})
      req.then((response) => {
        console.log("still logged")
      })
    }, 4500)
  }
}

const chat = {
  getMessages() {
    const request = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
    request.then(this.populateChat)
  },

  populateChat(response) {
    console.log(response.data)
  }
}

// Declarations

enterRoom.sendUserName()
chat.getMessages()
