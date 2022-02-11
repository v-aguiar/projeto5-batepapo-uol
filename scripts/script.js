let USERNAME = ''
let VISIBILITY = 'message'
let RECEIVER = 'Todos'

const user = {
  stayLoggedInterval: 0,

  sendUserName() {
    const name = prompt("Qual o seu lindo nome?")
    USERNAME = name

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
      const request = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name: USERNAME})
      request.then(() => {
        console.log("still logged")
      })
    }, 4500)
  },

  getAllLoggedInUsers() {
    const request = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
    request.then(sidebar.displayUsernames)
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
        if((USERNAME === message.from) || (USERNAME === message.to)) {
          messageDiv.classList.add("message", `--${message.type}`)
          messageDiv.innerHTML = messageStructure
          messagesContainer.appendChild(messageDiv)
          messageDiv.scrollIntoView()
        }
      } else {
        messageDiv.classList.add("message", `--${message.type}`)
        messageDiv.setAttribute("data-identifier", "message")
        messageDiv.innerHTML = messageStructure
        messagesContainer.appendChild(messageDiv)
        messageDiv.scrollIntoView()
      }
    })
  },

  buildMessageStructure(message) {
    const ifPrivateMessage = message.type === 'private_message' ? 'reservadamente' : ''
    const ifPublicMessage = (message.type === 'message' || message.type === 'private_message') ? `${ifPrivateMessage} para <strong> ${message.to}:</strong>` : ''

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
      from: USERNAME,
      to: RECEIVER,
      text: `${text.value}`,
      type: VISIBILITY
    }

    console.log(messageData)

    const validateSentMessage = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", messageData)

    text.value = ''

    validateSentMessage.then(chat.getMessages)
    // validateSentMessage.catch(() => {window.location.reload()})
  }
}

const modal = {
  modalElement: document.querySelector(".modal"),

  openModal() {
    user.getAllLoggedInUsers()
    setInterval(() => {user.getAllLoggedInUsers()}, 10000)

    this.modalElement.classList.remove("--hidden")

    this.modalElement.querySelector(".modal__clickable-area").addEventListener("click", () => {
      this.closeModal()
    })
  },

  closeModal() {
    this.modalElement.classList.add("--hidden")
  }
}

const sidebar = {
  selectLine(clickedLine) {
    const usersLines = document.querySelectorAll(".sidebar__onlineUsers li")
    const visibilityLines = document.querySelectorAll(".sidebar__visibility li")

    let isVisibilityLine = false

    visibilityLines.forEach((visibilityLine) => {
      (visibilityLine === clickedLine) ? isVisibilityLine = true : false
    })

    if(!isVisibilityLine) {
      usersLines.forEach((userLine) => {
        const areUsersTheSame = (userLine === clickedLine)
        const isCheckmarkHidden = (userLine.querySelector(".sidebar__checkmark").classList.contains("--hidden"))

        if(!areUsersTheSame && !isCheckmarkHidden) {
          userLine.style.justifyContent = "initial"
          userLine.querySelector(".sidebar__checkmark").classList.add("--hidden")
        } else if(areUsersTheSame && isCheckmarkHidden) {
          clickedLine.style.justifyContent = "space-between"
          clickedLine.querySelector(".sidebar__checkmark").classList.remove("--hidden")

          sidebar.getReceiver(clickedLine)
        }
      })
    } else {
      visibilityLines.forEach((visibilityLine) => {
        const areTypesTheSame = (visibilityLine === clickedLine)
        const isCheckmarkHidden = (visibilityLine.querySelector(".sidebar__checkmark").classList.contains("--hidden"))

        if(!areTypesTheSame && !isCheckmarkHidden) {
          visibilityLine.style.justifyContent = "initial"
          visibilityLine.querySelector(".sidebar__checkmark").classList.add("--hidden")

        } else if(areTypesTheSame && isCheckmarkHidden) {
          clickedLine.style.justifyContent = "space-between"
          clickedLine.querySelector(".sidebar__checkmark").classList.remove("--hidden")

          sidebar.getVisibility(clickedLine)
        }
      })
    }
  },

  getReceiver(clickedLine) {
    const receiver = clickedLine.querySelector("p").innerText

    RECEIVER = receiver
  },

  getVisibility(clickedLine) {
    const visibility = clickedLine.querySelector("p").innerText

    if(visibility === "Privado") {
      VISIBILITY = "private_message"
    } else if(visibility === "Público") {
      VISIBILITY = "message"
    }
  },

  displayUsernames(response) {
    const linesContainer = document.querySelector(".sidebar__onlineUsers ul")

    linesContainer.innerHTML = ''

    response.data.forEach((name) => {
      setInterval(sidebar.buildSidebarLineStructure(name.name), 1000)
    })
  },

  buildSidebarLineStructure(name) {
    const linesContainer = document.querySelector(".sidebar__onlineUsers ul")

    const lineStructure = `
    <li onclick="sidebar.selectLine(this)" class="sidebar__line" data-identifier="participant">
      <span>
        <img class="sidebar__icon" src="./assets/person-icon.svg" alt="person icon">
        <p>${name}</p>
      </span>
      <img class="sidebar__checkmark --hidden" src="./assets/checkmark-icon.svg" alt="Check icon">
    </li>
    `

    linesContainer.innerHTML += lineStructure
  }
}
// Declarations

setInterval(() => {chat.getMessages()}, 3000)
user.sendUserName()
