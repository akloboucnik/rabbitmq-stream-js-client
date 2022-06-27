import { Command } from "./command"
import {
  OpenResponse,
  PeerPropertiesResponse,
  SaslAuthenticateResponse,
  SaslHandshakeResponse,
} from "./peer_properties_response"

export class OpenRequest implements Command {
  readonly responseKey = OpenResponse.key
  readonly key = 0x0015
  readonly version = 1

  constructor(private params: { virtualHost: string }) {}

  toBuffer(correlationId: number): Buffer {
    let offset = 4
    const b = Buffer.alloc(1024)
    offset = b.writeUInt16BE(this.key, offset)
    offset = b.writeUInt16BE(this.version, offset)
    offset = b.writeUInt32BE(correlationId, offset)

    offset = writeString(b, offset, this.params.virtualHost)

    b.writeUInt32BE(offset - 4, 0)
    return b.slice(0, offset)
  }
}

export class SaslAuthenticateRequest implements Command {
  readonly responseKey = SaslAuthenticateResponse.key
  readonly key = 0x0013
  readonly version = 1

  constructor(private params: { mechanism: string; username: string; password: string }) {}

  toBuffer(correlationId: number): Buffer {
    let offset = 4
    const b = Buffer.alloc(1024)
    offset = b.writeUInt16BE(this.key, offset)
    offset = b.writeUInt16BE(this.version, offset)
    offset = b.writeUInt32BE(correlationId, offset)

    offset = writeString(b, offset, this.params.mechanism)

    offset = b.writeUInt32BE(this.params.password.length + this.params.username.length + 2, offset)
    offset = b.writeUInt8(0, offset)
    const uw = b.write(this.params.username, offset)
    offset += uw
    offset = b.writeUInt8(0, offset)
    const pw = b.write(this.params.username, offset)
    offset += pw

    b.writeUInt32BE(offset - 4, 0)
    return b.slice(0, offset)
  }
}

export class SaslHandshakeRequest implements Command {
  readonly responseKey = SaslHandshakeResponse.key
  readonly key = 0x0012
  readonly version = 1

  toBuffer(correlationId: number): Buffer {
    let offset = 4
    const b = Buffer.alloc(1024)
    offset = b.writeUInt16BE(this.key, offset)
    offset = b.writeUInt16BE(this.version, offset)
    offset = b.writeUInt32BE(correlationId, offset)
    b.writeUInt32BE(offset - 4, 0)
    return b.slice(0, offset)
  }
}

export const PROPERTIES = {
  product: "RabbitMQ Stream",
  version: "0.0.1",
  platform: "javascript",
  copyright: "Copyright (c) 2020-2021 Coders51 srl",
  information: "Licensed under the Apache 2.0 and MPL 2.0 licenses. See https://www.rabbitmq.com/",
  connection_name: "Unknown",
}

export class PeerPropertiesRequest implements Command {
  readonly key = 0x11
  readonly responseKey = PeerPropertiesResponse.key
  readonly version = 1
  private readonly _properties: { key: string; value: string }[] = []

  constructor(properties: Record<string, string> = PROPERTIES) {
    this._properties = Object.keys(properties).map((key) => ({ key, value: properties[key] }))
  }

  toBuffer(correlationId: number): Buffer {
    let offset = 4
    const b = Buffer.alloc(1024)
    offset = b.writeUInt16BE(this.key, offset)
    offset = b.writeUInt16BE(this.version, offset)
    offset = b.writeUInt32BE(correlationId, offset)
    offset = b.writeUInt32BE(this._properties.length, offset)

    this._properties.forEach(({ key, value }) => {
      offset = writeString(b, offset, key)
      offset = writeString(b, offset, value)
    })

    b.writeUInt32BE(offset - 4, 0)
    return b.slice(0, offset)
  }
}

function writeString(buffer: Buffer, offset: number, s: string) {
  const newOffset = buffer.writeInt16BE(s.length, offset)
  const written = buffer.write(s, newOffset, "utf8")
  return newOffset + written
}