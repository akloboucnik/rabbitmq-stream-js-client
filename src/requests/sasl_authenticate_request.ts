import { SaslAuthenticateResponse } from "../responses/sasl_authenticate_response"
import { AbstractRequest } from "./abstract_request"
import { DataWriter } from "./data_writer"

export class SaslAuthenticateRequest extends AbstractRequest {
  readonly responseKey = SaslAuthenticateResponse.key
  readonly key = 0x0013

  constructor(private params: { mechanism: string; username: string; password: string }) {
    super()
  }

  protected writeContent(writer: DataWriter): void {
    writer.writeString(this.params.mechanism)
    writer.writeUInt32(this.params.password.length + this.params.username.length + 2)
    writer.writeUInt8(0)
    writer.writeData(this.params.username)
    writer.writeUInt8(0)
    writer.writeData(this.params.username)
  }
}
