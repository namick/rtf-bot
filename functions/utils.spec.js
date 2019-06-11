const { Timestamp } = require('./firebase')
const { addMinutes, minutesLeft } = require('./utils')

describe('addMinutes', () => {
  it('returns a new Firebase timestamp from provided timestamp with added minutes', () => {
    const timestamp1 = Timestamp.fromDate(new Date('01-01-2000 12:00:00'))
    const timestamp2 = Timestamp.fromDate(new Date('01-01-2000 12:42:00'))

    expect(addMinutes(42, timestamp1).isEqual(timestamp2)).toBe(true)
  })
})

describe('minutesLeft', () => {
  it('returns the minutes left from now to a timestamp', () => {
    const nowTimestamp = Timestamp.fromDate(new Date('01-01-2000 12:00:00'))
    const futureTimestamp = Timestamp.fromDate(new Date('01-01-2000 12:42:00'))

    expect(minutesLeft(futureTimestamp, nowTimestamp)).toBe(42)
  })
})

describe('minutesLeft', () => {
  it('returns 0 minutes if less than a minute', () => {
    const nowTimestamp = Timestamp.fromDate(new Date('01-01-2000 12:00:00'))
    const futureTimestamp = Timestamp.fromDate(new Date('01-01-2000 12:00:01'))

    expect(minutesLeft(futureTimestamp, nowTimestamp)).toBe(0)
  })
})

describe('minutesLeft', () => {
  it('returns 1 minute if more than a minute', () => {
    const nowTimestamp = Timestamp.fromDate(new Date('01-01-2000 12:00:00'))
    const futureTimestamp = Timestamp.fromDate(new Date('01-01-2000 12:01:01'))

    expect(minutesLeft(futureTimestamp, nowTimestamp)).toBe(1)
  })
})

describe('minutesLeft', () => {
  it('defaults to Timestamp.now()', () => {
    const futureTimestamp = addMinutes(1)

    expect(minutesLeft(futureTimestamp)).toBe(1)
  })
})
