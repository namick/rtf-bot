const { Timestamp } = require('./firebase')

const addMinutes = (minutes, timestamp = Timestamp.now()) => {
  const seconds = minutes * 60
  const timestampSeconds = timestamp.seconds + seconds
  return Timestamp.fromMillis(timestampSeconds * 1000)
}

const minutesLeft = (futureTimestamp, nowTimestamp = Timestamp.now()) => {
  const futureSeconds = futureTimestamp.seconds
  const nowSeconds = nowTimestamp.seconds
  const seconds = futureSeconds - nowSeconds
  return Math.floor(seconds / 60)
}

module.exports = {
  addMinutes,
  minutesLeft,
}
