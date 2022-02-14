// Global variables

let USERNAME = ''
let VISIBILITY = 'message'
let RECEIVER = 'Todos'
let MessageListener = ''

// Functions

const user = {
  stayLoggedInterval: 0,

  listenUserLogin() {
    const loginForm = document.querySelector(".login-page form")

    loginForm.addEventListener("submit", user.sendUserName)
  },

  sendUserName(event) {
    loadingEvent.toogleDisplayLoadingPage()

    const name = event.target[0].value
    USERNAME = name

    const request = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", {name: USERNAME})
    request.then(user.keepUserLoggedIn)
    request.catch(user.userAlreadyLoggedIn)

    event.preventDefault()
  },

  keepUserLoggedIn(response) {
    loadingEvent.toogleDisplayLoadingPage()
    chat.listenMessageInputClick()
    user.closeLoginPage()

    user.stayLoggedInterval = setInterval(() => {
      const request = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name: USERNAME})
      request.then(() => {})
    }, 4500)
  },

  getUserName() {
    return document.querySelector("#login-page__input").value
  },

  userAlreadyLoggedIn(error) {
    alert("User already logged in, please enter different name!")
    window.location.reload()
  },

  closeLoginPage() {
    const loginPageSection = document.querySelector(".login-page")

    loginPageSection.classList.add("--hidden")
  },

  getAllLoggedInUsers() {
    const request = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
    request.then(sidebar.displayUsernames)
  }
}

const loadingEvent = {
  toogleDisplayLoadingPage() {
    const loadingSection = document.querySelector(".loading-page")
    const loginForm = document.querySelector(".login-page form")

    if(!loginForm.classList.contains("--hidden")) {
      loginForm.classList.add("--hidden")
    } else {
      loginForm.classList.remove("--hidden")
    }

    if(!loadingSection.classList.contains("--hidden")) {
      loadingSection.classList.add("--hidden")
    } else {
      loadingSection.classList.remove("--hidden")
    }
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
          messageDiv.setAttribute("data-identifier", "message")
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

  listenMessageInputClick() {
    const messageInputField = document.getElementById("message")
    messageInputField.addEventListener("click", chat.listenEnterKey)
  },

  listenEnterKey() {
    const messageField = document.querySelector("#message")

    messageField.addEventListener("keyup", chat.sendOnKeyUp)
  },

  sendOnKeyUp(event) {
    const sendMessageButton = document.querySelector("footer button")
    const messageField = document.querySelector("#message")

    if(event.keyCode === 13) {
      event.preventDefault()

      sendMessageButton.click()
      messageField.removeEventListener("keyup", chat.sendOnKeyUp)
      chat.listenEnterKey()
    }
  },

  sendMessage() {
    const text = document.querySelector("#message").value

    const messageData = {
      from: USERNAME,
      to: RECEIVER,
      text: text,
      type: VISIBILITY
    }

    console.log(messageData)
    setTimeout(() => {
      const validateSentMessage = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", messageData)
      validateSentMessage.then(chat.getMessages)
      validateSentMessage.catch(() => {window.location.reload()})
    }, 1000)

    document.querySelector("#message").value = ''

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
    sidebar.changeInputReceiver()
  },

  getVisibility(clickedLine) {
    const visibility = clickedLine.querySelector("p").innerText

    if(visibility === "Privado") {
      VISIBILITY = "private_message"
    } else if(visibility === "Público") {
      VISIBILITY = "message"
    }

    console.log(VISIBILITY)

    sidebar.changeInputReceiver()
  },

  changeInputReceiver() {
    const inputReceiver = document.querySelector(".input-description p")

    const isMessagePrivate = (VISIBILITY === "private_message") ? `${RECEIVER} (reservadamemte)` : `${RECEIVER}`
    const message = `Enviando para ${isMessagePrivate}`

    inputReceiver.innerText = message
  },

  displayUsernames(response) {
    const linesContainer = document.querySelector(".sidebar__onlineUsers ul")

    linesContainer.innerHTML = `
      <li onclick="sidebar.selectLine(this)" class="sidebar__line">
        <span>
          <img class="sidebar__icon" src="./assets/people-icon.svg" alt="People icon">
          <p>Todos</p>
        </span>
        <img class="sidebar__checkmark --hidden" src="./assets/checkmark-icon.svg" alt="Check icon">
      </li>
    `

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

user.listenUserLogin()

setInterval(() => {chat.getMessages()}, 3000)
