const functions = require('firebase-functions')
const line = require('@line/bot-sdk')

const config = {
  channelAccessToken: functions.config().line.token,
  channelSecret: functions.config().line.secret,
}

const client = new line.Client(config)
const middleware = line.middleware(config)

const RTFTestGroupId = "C5529a495942bf12cba67a873e304761a"
const RTFGroupId = "C9950342494e9e055ddca1dc3053e7f0a"

module.exports = {
  client,
  middleware,
  groupId: RTFGroupId,
}
