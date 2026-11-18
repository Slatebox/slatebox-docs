import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(new URL('../assets/self-host/restore-instance.sh', import.meta.url))
function receiver(t) {
  const root = mkdtempSync(join(tmpdir(), 'slatebox-restore-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const host = join(root, 'self-host')
  const backup = join(root, 'backup')
  const bin = join(root, 'bin')
  for (const path of [host, backup, bin]) mkdirSync(path)
  for (const [file, value] of Object.entries({
    platform: 'linux/arm64', 'app-image': 'test/app:1', 'relay-image': 'test/relay:1',
    'images.txt': 'test/app:1\ntest/relay:1\nmongo:test\n', 'images.tar.gz': 'fixture',
  })) writeFileSync(join(root, file), value)
  writeFileSync(join(host, 'run'), '#!/bin/sh\necho mongo:test\n', { mode: 0o700 })
  writeFileSync(join(root, 'settings.json'), '{}')
  writeFileSync(join(root, 'instance.env'), 'APP_PORT=7070\n')
  execFileSync('tar', ['-czf', join(backup, 'instance.tgz'), '-C', root, 'settings.json', 'instance.env'])
  writeFileSync(join(backup, 'mongo-data.tgz'), 'fake database contents')
  const sums = ['mongo-data.tgz', 'instance.tgz'].map(file =>
    createHash('sha256').update(readFileSync(join(backup, file))).digest('hex') + '  ' + file)
  writeFileSync(join(backup, 'SHA256SUMS'), sums.join('\n') + '\n')
  writeFileSync(join(bin, 'docker'), `#!/bin/sh
set -eu
printf '%s %s\\n' "$1" "\${2:-}" >> "$RESTORE_TEST/log"
case "$1 \${2:-}" in
  'version --format') echo linux/arm64 ;;
  'ps -aq'|'network ls') ;;
  'volume ls') if [ "\${COLLISION:-}" = yes ]; then echo trial_mongo-data; fi ;;
  'image load'|'image inspect') ;;
  'volume create') for arg in "$@"; do
      case "$arg" in com.slatebox.restore=*) echo "\${arg#*=}" > "$RESTORE_TEST/marker";; esac
    done ;;
  'volume inspect') cat "$RESTORE_TEST/marker" ;;
  'volume rm') rm "$RESTORE_TEST/marker" ;;
  'run --rm') case " $* " in *restore-settings*) test -z "$NO_BIND"; exit;; esac
    cat >/dev/null; test "\${TRUNCATED:-}" != yes ;;
  *) exit 3 ;;
esac\n`, { mode: 0o700 })
  const state = join(host, '.state')
  const restore = (extra = {}) => spawnSync('bash', [script, backup], {
    cwd: host, encoding: 'utf8', env: { ...process.env, COMPOSE_PROJECT_NAME: 'trial', NO_BIND: '',
      SLATEBOX_STATE: state, RESTORE_TEST: root, PATH: bin + ':' + process.env.PATH, ...extra },
  })
  return { root, state, backup, restore, log: () => readFileSync(join(root, 'log'), 'utf8') }
}

test('a bad checksum or occupied project stops before loading images or creating settings', t => {
  const f = receiver(t)
  assert.notEqual(f.restore({ COLLISION: 'yes' }).status, 0)
  writeFileSync(join(f.backup, 'mongo-data.tgz'), 'damaged')
  assert.match(f.restore().stderr, /checksum mismatch/)
  assert.doesNotMatch(f.log(), /image load|volume create/)
  assert.equal(existsSync(f.state), false)
})

test('failed extraction releases its volume and new settings path so a retry can restore', t => {
  const f = receiver(t)
  assert.notEqual(f.restore({ TRUNCATED: 'yes' }).status, 0)
  assert.equal(existsSync(join(f.root, 'marker')), false)
  assert.equal(existsSync(f.state), false)
  const retry = f.restore()
  assert.equal(retry.status, 0, retry.stderr)
  assert.equal(readFileSync(join(f.state, 'settings.json'), 'utf8'), '{}')
  assert.match(readFileSync(join(f.state, 'instance.env'), 'utf8'), /APP_PORT=7070[\s\S]+APP_IMAGE='test\/app:1'/)
  assert.match(f.restore().stderr, /new settings directory/)
})

test('an unshared daemon path fails before creating a database volume', t => {
  const f = receiver(t)
  assert.match(f.restore({ NO_BIND: 'yes' }).stderr, /directories shared with the Docker daemon/)
  assert.doesNotMatch(f.log(), /volume create/)
  assert.equal(existsSync(f.state), false)
})
