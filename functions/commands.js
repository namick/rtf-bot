const { db, Timestamp } = require('./firebase')
const line = require('./line')
const { addMinutes, minutesLeft } = require('./utils')
const _ = require('lodash')

const bossList = async event => {
  const querySnapshot = await db.collection('bosses').get()
  const list = querySnapshot.docs.map(doc => `${doc.id} - Respawn time: ${doc.data().due} minutes`)
  const reply = { type: 'text', text: list.join('\n') }
  return line.client.replyMessage(event.replyToken, reply)
}

const bossTimers = async event => {
  const querySnapshot = await db.collection('timers').get()
  const list = querySnapshot.docs.map(doc => {
    const { dueTimestamp } = doc.data()
    return `${doc.id} due in ${minutesLeft(dueTimestamp)} minutes`
  })
  const reply = querySnapshot.empty ? (
    { type: 'text', text: 'There are no active timers. Set a timer by saying "[Boss name] down"' }
  ) : (
      { type: 'text', text: list.join('\n') }
    )
  return line.client.replyMessage(event.replyToken, reply)
}

const bossDown = async event => {
  const bossName = _.capitalize(event.message.text.split(' ')[0])
  const boss = await db.collection('bosses').doc(bossName).get()
  let text = ''
  if (boss.exists) {
    const { due } = boss.data()
    const dueTimestamp = addMinutes(due)
    await db.collection('timers').doc(bossName).set({ dueTimestamp, warned: false })
    text = `${bossName} timer set for ${due} minutes`
  } else {
    text = `Hmmm, not sure I recognize the boss "${bossName}"\n`
    text += 'Say: "boss list" to get a list of known bosses'
  }
  const message = { type: 'text', text: text }
  return line.client.replyMessage(event.replyToken, message)
}

const bossTimerSet = async event => {
  const bossName = _.capitalize(event.message.text.split(' ')[0])
  const minutes = Number(event.message.text.split(' ')[3])
  const boss = await db.collection('bosses').doc(bossName).get()
  let text = ''
  if (boss.exists) {
    const dueTimestamp = addMinutes(minutes)
    await db.collection('timers').doc(bossName).set({ dueTimestamp, warned: false })
    text = `${bossName} timer set for ${minutes} minutes`
  } else {
    text = `Hmmm, not sure I recognize the boss "${bossName}"\n`
    text += 'Say: "boss list" to get a list of known bosses'
  }
  const message = { type: 'text', text: text }
  return line.client.replyMessage(event.replyToken, message)
}

const bossTimerClear = async event => {
  const bossName = _.capitalize(event.message.text.split(' ')[0])
  const boss = await db.collection('bosses').doc(bossName).get()
  let text = ''
  if (boss.exists) {
    const dueTimestamp = addMinutes(minutes)
    await db.collection('timers').doc(bossName).delete()
    text = `${bossName} timer has been cleared`
  } else {
    text = `Hmmm, not sure I recognize the boss "${bossName}"\n`
    text += 'Say: "boss list" to get a list of known bosses'
  }
  const message = { type: 'text', text: text }
  return line.client.replyMessage(event.replyToken, message)
}

const bossAdd = async event => {
  const bossName = _.capitalize(event.message.text.split(' ')[0])
  const due = Number(event.message.text.split(' ')[2])
  const boss = await db.collection('bosses').doc(bossName).set({ due })
  const message = { type: 'text', text: `Boss "${bossName}" added with a respawn time of ${due} minutes` }
  return line.client.replyMessage(event.replyToken, message)
}

const bossRemove = async event => {
  const bossName = _.capitalize(event.message.text.split(' ')[0])
  const due = Number(event.message.text.split(' ')[2])
  await db.collection('bosses').doc(bossName).delete()
  const message = { type: 'text', text: `Boss "${bossName}" removed` }
  return line.client.replyMessage(event.replyToken, message)
}

module.exports = {
  bossList,
  bossTimers,
  bossDown,
  bossTimerSet,
  bossTimerClear,
  bossAdd,
  bossRemove,
}

const sampleEvent = {
  "type": "message",
  "replyToken": "f9bed69f0779437bb9c90321afd03db0",
  "source": {
    "groupId": "Ca2c272efa89b571a5e700a0bc98398d0",
    "type": "group"
  },
  "timestamp": 1559661516660,
  "message": {
    "type": "text",
    "id": "9984951011854",
    "text": "bosses"
  }
}

