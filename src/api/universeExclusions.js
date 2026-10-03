import request from '@/utils/request'

export const getUniverseExclusionOverview = (params = {}) => request({
  method: 'GET',
  url: '/gpfx/universe-exclusions/',
  params,
})

export const refreshUniverseExclusionSnapshot = data => request({
  method: 'POST',
  url: '/gpfx/universe-exclusions/refresh/',
  data,
  timeout: 60000,
})
