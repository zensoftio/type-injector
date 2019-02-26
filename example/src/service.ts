import {injectable, Injectable} from 'react-dependency-injection'

@injectable('Service')
export default class Service implements Injectable {

  public value: 'Hello World!'

  public awakeAfterInjection(): void {
    // @ts-ignore
  }

  public postConstructor(): void {
    // @ts-ignore
  }
}
