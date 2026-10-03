import request from '@/utils/request'

export const getAlertExclusionOverview = (params = {}) => request({
  method: 'GET',
  url: '/gpfx/alert-exclusions/',
  params,
})

export const updateAlertExclusionRule = data => request({
  method: 'POST',
  url: '/gpfx/alert-exclusions/rules/update/',
  data,
})

export const refreshAlertExclusionSnapshot = data => request({
  method: 'POST',
  url: '/gpfx/alert-exclusions/refresh/',
  data,
  timeout: 60000,
})
