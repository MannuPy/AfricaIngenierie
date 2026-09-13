import { readFile } from 'node:fs/promises'

const file = process.argv[2]
const minimum = 0.9

if (!file) {
  console.error('Usage: node scripts/assert-lighthouse.mjs <report.json>')
  process.exit(2)
}

const report = JSON.parse(await readFile(file, 'utf8'))
const checks = ['performance', 'accessibility']
const failures = []

for (const category of checks) {
  const score = report.categories?.[category]?.score
  if (typeof score !== 'number' || score < minimum) {
    failures.push(`${category}: ${typeof score === 'number' ? Math.round(score * 100) : 'absent'} (minimum 90)`)
  } else {
    console.log(`✓ Lighthouse ${category}: ${Math.round(score * 100)}`)
  }
}

if (failures.length > 0) {
  console.error(`✗ Lighthouse: ${failures.join(', ')}`)
  process.exit(1)
}
