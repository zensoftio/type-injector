import {Injectable} from 'type-injector'

export interface PostService extends Injectable {

}

interface User {
  id: number
  username: string
}

export interface UserService extends Injectable {
  getUsers(): User[]
}
