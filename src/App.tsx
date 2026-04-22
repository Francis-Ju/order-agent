import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence as _AP } from 'motion/react'
const AnimatePresence = _AP as unknown as React.ElementType
import { fetchStores } from './lib/api.js'
import { useAgent } from './hooks/useAgent.js'
import { useIsMobile } from './hooks/useIsMobile.js'
import { PhoneFrame } from './components/layout/PhoneFrame.js'
import { DemoShell } from './components/layout/DemoShell.js'
import { StoreList } from './components/stores/StoreList.js'
import { AgentPanel } from './components/agent/AgentPanel.js'
import type { Store } from './types/index.js'

function AppContent({
  stores,
  loading,
  selectedStore,
  agentState,
  isMobile,
  onSelectStore,
  onBack,
}: {
  stores: Store[]
  loading: boolean
  selectedStore: Store | null
  agentState: ReturnType<typeof useAgent>['state']
  isMobile: boolean
  onSelectStore: (s: Store) => void
  onBack: () => void
}) {
  return (
    <AnimatePresence mode="wait">
      {selectedStore ? (
        <motion.div
          key="agent"
          className="h-full"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        >
          <AgentPanel
            store={selectedStore}
            agentState={agentState}
            onBack={onBack}
            isMobile={isMobile}
          />
        </motion.div>
      ) : (
        <motion.div
          key="stores"
          className="h-full"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        >
          <StoreList
            stores={stores}
            loading={loading}
            onSelectStore={onSelectStore}
            isMobile={isMobile}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const { state: agentState, trigger, reset } = useAgent()
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchStores()
      .then(setStores)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store)
    trigger(store.store_id)
  }

  const handleBack = () => {
    setSelectedStore(null)
    reset()
  }

  const content = (
    <AppContent
      stores={stores}
      loading={loading}
      selectedStore={selectedStore}
      agentState={agentState}
      isMobile={isMobile}
      onSelectStore={handleSelectStore}
      onBack={handleBack}
    />
  )

  if (isMobile) {
    return (
      <div className="h-[100dvh] w-full bg-[#09090b] overflow-hidden">
        {content}
      </div>
    )
  }

  return (
    <DemoShell agentState={agentState}>
      <PhoneFrame>{content}</PhoneFrame>
    </DemoShell>
  )
}
