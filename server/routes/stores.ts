import { Router } from 'express'
import { getAllStores, getStoreById } from '../data/loader.js'

export const storesRouter = Router()

storesRouter.get('/', (_req, res) => {
  res.json({ stores: getAllStores() })
})

storesRouter.get('/:id', (req, res) => {
  const store = getStoreById(req.params.id)
  if (!store) return res.status(404).json({ error: 'Store not found' })
  return res.json({ store })
})
