import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 轻量级 Mock 插件（零第三方依赖，兼容任意 Vite 版本）
 *
 * mock 模块约定：mock 目录下每个文件 default 导出一个数组
 *   [{ url, method, response }]
 * - url:    接口路径，例如 '/api/user/list'
 * - method: 'get' | 'post' | 'put' | 'delete' ...（小写）
 * - response: 可直接返回数据对象，或 (ctx) => data | Promise<data>
 *      ctx = { body, query, headers, req }
 *
 * 同时挂载到 dev server 与 preview server，文件变更自动热加载。
 */
export function mockPlugin(options = {}) {
  const { mockDir = 'mock', enabled = true } = options
  let cache = null
  let watching = false

  const resolveDir = () => path.resolve(process.cwd(), mockDir)

  async function loadMocks() {
    const dir = resolveDir()
    if (!fs.existsSync(dir)) return []
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(js|mjs|ts|mts|cts)$/.test(f))
      // 跳过以下划线开头的依赖模块（如 _shared.js）：它们只作为其他 mock 的 import 依赖，
      // 不直接作为路由源；若不跳过，plugin 用 ?t= 额外加载会与其被裸 import 的实例分裂，造成共享状态双实例。
      .filter((f) => !f.startsWith('_'))
    const all = []
    for (const file of files) {
      // 追加时间戳以绕过 ESM 模块缓存，实现 mock 文件热更新
      const mod = await import(path.join(dir, file) + `?t=${Date.now()}`)
      const def = mod.default
      if (Array.isArray(def)) all.push(...def)
    }
    return all
  }

  function attach(server) {
    if (!watching) {
      watching = true
      const dir = resolveDir()
      if (fs.existsSync(dir)) {
        fs.watch(dir, () => {
          cache = null
        })
      }
    }

    server.middlewares.use(async (req, res, next) => {
      try {
        if (!cache) cache = await loadMocks()
        const url = (req.url || '').split('?')[0]
        const method = (req.method || 'get').toLowerCase()
        const matched = matchMock(cache, url, method)
        if (!matched) return next()

        let body = {}
        if (['post', 'put', 'delete', 'patch'].includes(method)) {
          body = await readBody(req)
        }
        const result =
          typeof matched.mock.response === 'function'
            ? await matched.mock.response({
                body,
                query: parseQuery(req.url),
                headers: req.headers,
                req,
                params: matched.params,
              })
            : matched.mock.response

        const payload =
          typeof result === 'string' ? result : JSON.stringify(result)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(payload)
      } catch (err) {
        next(err)
      }
    })
  }

  return {
    name: 'vite-plugin-mock-custom',
    configureServer(server) {
      if (enabled) attach(server)
    },
    configurePreviewServer(server) {
      if (enabled) attach(server)
    },
  }
}

function matchMock(mocks, url, method) {
  // 1) 精确匹配优先（向后兼容既有 mock，如 /api/home/overview/）
  const exact = mocks.find(
    (m) => m.url === url && m.method.toLowerCase() === method,
  )
  if (exact) return { mock: exact, params: {} }
  // 2) 参数化匹配：url 段支持 :name 占位（如 /api/academic-years/:id/activate/）
  const uSegs = url.split('/').filter(Boolean)
  for (const m of mocks) {
    if (m.method.toLowerCase() !== method) continue
    const mSegs = m.url.split('/').filter(Boolean)
    if (mSegs.length !== uSegs.length) continue
    const params = {}
    let ok = true
    for (let i = 0; i < mSegs.length; i++) {
      if (mSegs[i].startsWith(':')) {
        params[mSegs[i].slice(1)] = decodeURIComponent(uSegs[i])
      } else if (mSegs[i] !== uSegs[i]) {
        ok = false
        break
      }
    }
    if (ok) return { mock: m, params }
  }
  return null
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

function parseQuery(url = '') {
  const q = url.split('?')[1]
  if (!q) return {}
  return Object.fromEntries(new URLSearchParams(q))
}
