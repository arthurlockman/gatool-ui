import { useCallback, useEffect, useState } from 'react'
import * as serviceWorkerRegistration from '../serviceWorkerRegistration'

export const useServiceWorker = () => {
    const [waitingWorker, setWaitingWorker] = useState(null)
    const [showReload, setShowReload] = useState(false)

    const onSWUpdate = useCallback((registration) => {
        setShowReload(true)
        setWaitingWorker(registration.waiting)
    }, [])

    const reloadPage = useCallback(() => {
        waitingWorker?.postMessage({ type: "SKIP_WAITING" })
        setShowReload(false)
        window.location.reload()
    }, [waitingWorker])

    useEffect(() => {
        serviceWorkerRegistration.register({
            onUpdate: onSWUpdate
        })
    }, [onSWUpdate])

    return { showReload, waitingWorker, reloadPage }
}