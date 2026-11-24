// The install guide's first command is `npx slatebox`. Publishing the guide before
// the package would send every reader into a failing first command, so the publish workflow runs
// this check first: it passes only when the npm package `slatebox` exists and its latest version
// has the slatebox command and the install subcommand's agent brief.
//
//   node scripts/check-installer-published.mjs
import {readFile} from 'node:fs/promises'

// While the install guide is held (scripts/features.json "self-host": false) it is not built, so there is nothing to
// guard yet and this check passes. Switching the guide back on re-arms it: then the image (and the installer) must exist.
const features = JSON.parse(await readFile(new URL('./features.json', import.meta.url), 'utf8'))
if (features['self-host'] !== true) {
  console.log('The install guide is held (scripts/features.json "self-host" is off); nothing to check until it is published.')
  process.exit(0)
}
const response = await fetch('https://registry.npmjs.org/slatebox/latest')
if (!response.ok) {
  console.error(`npm: slatebox@latest is not published (${response.status}). Publish the installer before the install guide.`)
  process.exit(1)
}
const manifest = await response.json()
const bin = typeof manifest.bin === 'string' ? {slatebox: manifest.bin} : manifest.bin || {}
if (!bin.slatebox) {
  console.error(`npm: slatebox@${manifest.version} has no slatebox command. Publish the installer before the install guide.`)
  process.exit(1)
}
if (!/install/i.test(manifest.description || '')) {
  console.error(`npm: slatebox@${manifest.version} does not describe itself as the installer. Check the package name before publishing the guide.`)
  process.exit(1)
}
console.log(`npm: slatebox@${manifest.version} is published with the slatebox command.`)
