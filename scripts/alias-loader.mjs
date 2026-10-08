import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith('@/')) return nextResolve(specifier, context)
  let file = join(root, specifier.slice(2))
  if (!/\.(ts|tsx|js|mjs|json)$/.test(file)) {
    if (existsSync(`${file}.ts`)) file += '.ts'
    else if (existsSync(`${file}.tsx`)) file += '.tsx'
  }
  return nextResolve(pathToFileURL(file).href, context)
}
