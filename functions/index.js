const functions = require('firebase-functions')
const { db, Timestamp } = require('./firebase')
const line = require('./line')

const express = require('express')
const app = express()

const commands = require('./commands')
const { addMinutes, minutesLeft } = require('./utils')

app.post('/webhook', line.middleware, (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})

function handleEvent (event) {
  console.log('event.source.groupId', event.source.groupId)

  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null)
  }

  if (event.replyToken === '00000000000000000000000000000000') {
    console.log('Ignoring test event with reply token: ', event.replyToken)
    return Promise.resolve(null)
  }

  if (event.message.text.toLowerCase() === 'boss list') {
    return commands.bossList(event)
  }

  if (event.message.text.toLowerCase() === 'boss timers') {
    return commands.bossTimers(event)
  }

  const commandList = event.message.text.split(' ')

  if (commandList[1] === 'down') {
    return commands.bossDown(event)
  }
  if (commandList[1] === 'timer' && commandList[2] === 'set' && Number(commandList[3]) > 0) {
    return commands.bossTimerSet(event)
  }
  if (commandList[1] === 'timer' && commandList[2] === 'clear') {
    return commands.bossTimerClear(event)
  }
  if (commandList[1] === 'add' && Number(commandList[2]) > 0) {
    return commands.bossAdd(event)
  }
  if (commandList[1] === 'remove') {
    return commands.bossRemove(event)
  }
  if (event.message.text.toLowerCase() === 'commands') {
    const text = `
    [Boss name] down
     - Start a timer for a boss using its respawn time

    boss list
     - Show a list of all known bosses and their respawn times

    boss timers
     - Show a list of active timers`
    return line.client.replyMessage(event.replyToken, { type: 'text', text })
  }
  if (event.message.text.toLowerCase() === 'all commands') {
    const text = `
    [Boss name] down
     - Start a timer for a boss using its respawn time

    boss list
     - Show a list of all known bosses and their respawn times

    boss timers
     - Show a list of active timers

    [Boss name] timer set [minutes]
     - Manually Start or restart a timer for a specific number of minutes

    [Boss name] timer clear
     - Stop and clear a timer

    [Boss name] add [respawn minutes]
     - Add or update a boss with the specified respawn time

    [Boss name] remove
     - Remove a boss`
    return line.client.replyMessage(event.replyToken, { type: 'text', text })
  }

  return Promise.resolve(null)
}

exports.app = functions.https.onRequest(app)

exports.monitor = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  console.log('Starting monitor function')
  const nowTimestamp = addMinutes(1)
  const nowQuerySnapshot = await db.collection('timers')
    .where('dueTimestamp', '<', nowTimestamp).get()
  nowQuerySnapshot.forEach(async doc => {
    console.log('Starting push message for "due now"')
    try {
      await line.client.pushMessage(line.groupId, { type: 'text', text: `${doc.id} due now` })
    } catch (error) { console.error('Error pushing line message', error) }
    await db.collection('timers').doc(doc.id).delete()
  })

  const warningTimestamp = addMinutes(9)
  const warningQuerySnapshot = await db.collection('timers')
    .where('dueTimestamp', '<', warningTimestamp)
    .where('warned', '==', false).get()
  warningQuerySnapshot.forEach(async doc => {
    const minutes = minutesLeft(doc.data().dueTimestamp)
    console.log('Starting push message for "due in 8 minutes"')
    try {
      await line.client.pushMessage(line.groupId, { type: 'text', text: `${doc.id} due in ${minutes} minutes` })
    } catch (error) { console.error('Error pushing line message', error) }
    await db.collection('timers').doc(doc.id).update({ warned: true })
  })
})
