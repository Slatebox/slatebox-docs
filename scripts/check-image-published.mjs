// The install guide tells people to run the image below. Publishing the guide
// before the image would send every reader into a failing first command, so
// the publish workflow runs this check first: it passes only when anyone,
// without signing in, can pull the image.
//
//   node scripts/check-image-published.mjs
import {readFile} from 'node:fs/promises'

// While the install guide is held (scripts/features.json "self-host": false) it is not built, so there is nothing to
// guard yet and this check passes. Switching the guide back on re-arms it: then the image (and the installer) must exist.
const features = JSON.parse(await readFile(new URL('./features.json', import.meta.url), 'utf8'))
if (features['self-host'] !== true) {
  console.log('The install guide is held (scripts/features.json "self-host" is off); nothing to check until it is published.')
  process.exit(0)
}

const guide = await readFile(new URL('../Installation/install-with-docker.md', import.meta.url), 'utf8')
const names = [...new Set(guide.match(/ghcr\.io\/[a-z0-9._-]+\/[a-z0-9._-]+/g) || [])]
if (names.length !== 1) {
  console.error(`Expected the install guide to name one image, found: ${names.join(', ') || 'none'}`)
  process.exit(1)
}
const repository = names[0].slice('ghcr.io/'.length)

async function pullable() {
  const tokenResponse = await fetch(`https://ghcr.io/token?service=ghcr.io&scope=repository:${repository}:pull`)
  if (!tokenResponse.ok) return `no anonymous pull access (${tokenResponse.status})`
  const {token} = await tokenResponse.json()
  const manifest = await fetch(`https://ghcr.io/v2/${repository}/manifests/latest`, {
    method: 'HEAD',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json',
    },
  })
  if (!manifest.ok) return `no pullable latest manifest (${manifest.status})`
  if (!/index|manifest\.list/.test(manifest.headers.get('content-type') || '')) {
    return 'latest is a single-architecture image; publish linux/amd64 and linux/arm64 together'
  }
  return null
}

const problem = await pullable()
if (problem) {
  console.error(`ghcr.io/${repository}: ${problem}. Publish the image before the install guide.`)
  process.exit(1)
}
console.log(`ghcr.io/${repository}:latest can be pulled without signing in.`)
