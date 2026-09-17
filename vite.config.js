import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { mockPlugin } from './vite/plugin-mock.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 读取 .env.[mode] 中的 VITE_ 变量
  const env = loadEnv(mode, process.cwd(), '')
  const useMock = env.VITE_USE_MOCK === 'true'

  return {
    plugins: [
      vue(),
      tailwindcss(),
      // 开发时开启 Mock；生产构建默认关闭（可通过 .env.production 控制）
      mockPlugin({ enabled: useMock }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      open: false,
    },
    preview: {
      port: 4173,
    },
  }
})
