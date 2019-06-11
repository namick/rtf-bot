const admin = require('firebase-admin')
const firebase = admin.initializeApp()
const db = firebase.firestore()

module.exports = {
  db,
  Timestamp: admin.firestore.Timestamp,
}
