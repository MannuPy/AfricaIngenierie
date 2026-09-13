const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

;(async () => {
  const [svgFile, outFile, scaleArg] = process.argv.slice(2)
  const scale = Number(scaleArg || 2)
  const svg = fs.readFileSync(svgFile, 'utf8')
  const m = svg.match(/width="(\d+)"\s+height="(\d+)"/)
  const w = Number(m[1]), h = Number(m[2])

  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: scale,
  })
  await page.setContent(
    `<!doctype html><meta charset="utf-8">
     <style>html,body{margin:0;padding:0;background:#fff}svg{display:block}</style>
     ${svg}`,
    { waitUntil: 'load' },
  )
  await page.waitForTimeout(300)

  // Contrôle : aucun texte ne doit déborder du cadre du diagramme.
  const report = await page.evaluate(() => {
    const svgEl = document.querySelector('svg')
    const vb = svgEl.viewBox.baseVal
    const out = []
    for (const t of svgEl.querySelectorAll('text')) {
      const b = t.getBBox()
      out.push({ s: t.textContent.slice(0, 60), x: +b.x.toFixed(1), y: +b.y.toFixed(1),
                 w: +b.width.toFixed(1), h: +b.height.toFixed(1) })
    }
    const rects = []
    for (const r of svgEl.querySelectorAll('rect')) {
      const b = r.getBBox()
      rects.push({ x: b.x, y: b.y, w: b.width, h: b.height })
    }
    return { vb: { w: vb.width, h: vb.height }, texts: out, rects }
  })
  fs.writeFileSync(outFile.replace(/\.png$/, '.json'), JSON.stringify(report))

  await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width: w, height: h } })
  await browser.close()
  console.log(`rendu ${outFile} — ${w * scale}x${h * scale}`)
})()
