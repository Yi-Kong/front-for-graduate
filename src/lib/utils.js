import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * shadcn-vue 标准工具：合并 Tailwind 类名，后者覆盖前者冲突的工具类。
 * @param {...import('clsx').ClassValue} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
