import {Injectable} from 'react-dependency-injection'

export interface PostService extends Injectable {

}

interface User {
  id: number
  username: string
}

export interface UserService extends Injectable {
  getUsers(): User[]
}

export interface AuthService extends Injectable {
}
