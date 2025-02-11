import { io } from 'socket.io-client'
import { Message } from '../utils/Contexts/messagesContext'
import { User } from '../Interfaces/Responses'
import avatar from '../images/avatar.png'
import toast from '../components/UI/Toast'

const addUserToUsersList = async (user: User, setUsersList: Function) => {
  setUsersList((prevState: any) => {
    return [...prevState, user]
  })
  toast(`🦄 ${user.username} joined the room!`)
}

const removeUserFromUsersList = async (user: User, setUsersList: Function) => {
  const currentUser = localStorage.getItem('username')
  setUsersList((prevState: any) => {
    return prevState.filter((u: User) => u.userId !== user.userId)
  })
  const displayUserName = currentUser === user.username ? 'You' : user.username
  toast(`👋 ${displayUserName} left the room`)
}

const connectSocket = async (
  roomId: string,
  setMessages: Function,
  setUsersList: Function,
  loadInitialMessages: Function
) => {
  const newSocket = io(`${process.env.REACT_APP_SOCKET_HOST}`, {
    transports: ['websocket'],
  })
  newSocket?.connect()
  newSocket?.emit(
    'joinRoom',
    JSON.stringify({
      roomId,
    })
  )
  newSocket.on('newMessage', (data: Message) => {
    setMessages((m: Message[]) =>
      m.concat({
        image: avatar,
        ...data,
      })
    )
  })
  newSocket.on('userJoinRoom', (user: User) => {
    addUserToUsersList(user, setUsersList)
  })
  newSocket.on('userLeaveRoom', (user: User) => {
    removeUserFromUsersList(user, setUsersList)
  })

  newSocket.on('changeUserStatus', ({ username, online }) => {
    setUsersList((users: User[]) => {
      return users.map((u: User) => {
        if (u.username === username) {
          return { ...u, online }
        }
        return u
      })
    })
  })

  await loadInitialMessages()
  return newSocket
}

export default connectSocket
