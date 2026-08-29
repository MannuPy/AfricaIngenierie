/**
 * Envoi d'un e-mail de test vers Mailpit, sans dépendance externe.
 * Exécuté depuis le conteneur `cms`, seul service raccordé au réseau mail.
 *
 *   docker compose exec -T cms node scripts/smtp-test.mjs
 */
import net from 'node:net'

const HOST = process.env.SMTP_HOST || 'mailpit'
const PORT = Number(process.env.SMTP_PORT || 1025)
const FROM = process.env.SMTP_FROM_ADDRESS || 'no-reply@local.africa-ingenierie.test'
const TO = process.env.CONTACT_TO || 'contact@local.africa-ingenierie.test'
const SUBJECT = `Test socle Docker ${new Date().toISOString()}`

const socket = net.createConnection({ host: HOST, port: PORT })
socket.setEncoding('utf8')
socket.setTimeout(10_000)

const steps = [
  'EHLO africa-ingenierie.test',
  `MAIL FROM:<${FROM}>`,
  `RCPT TO:<${TO}>`,
  'DATA',
  [
    `From: Africa Ingenierie <${FROM}>`,
    `To: <${TO}>`,
    `Subject: ${SUBJECT}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    "Verification du socle Docker local (prompt 01).",
    'Si ce message apparait dans Mailpit, la chaine CMS -> SMTP fonctionne.',
    '.',
  ].join('\r\n'),
  'QUIT',
]

let index = 0
let buffer = ''

socket.on('data', (chunk) => {
  buffer += chunk
  if (!buffer.endsWith('\r\n')) return

  const code = Number(buffer.slice(0, 3))
  const line = buffer.trim().split('\r\n').pop()
  buffer = ''

  if (code >= 400) {
    console.error(`[smtp-test] ECHEC  -  le serveur a repondu : ${line}`)
    socket.destroy()
    process.exit(1)
  }

  if (index >= steps.length) {
    console.log(`[smtp-test] OK  -  message accepte par ${HOST}:${PORT}`)
    console.log(`[smtp-test] sujet : ${SUBJECT}`)
    socket.end()
    return
  }

  socket.write(steps[index++] + '\r\n')
})

socket.on('timeout', () => {
  console.error(`[smtp-test] ECHEC  -  delai depasse sur ${HOST}:${PORT}`)
  socket.destroy()
  process.exit(1)
})

socket.on('error', (error) => {
  console.error(`[smtp-test] ECHEC  -  ${error.message}`)
  process.exit(1)
})
