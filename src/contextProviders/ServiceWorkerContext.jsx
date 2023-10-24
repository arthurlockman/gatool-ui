import { useCallback, useEffect, useState } from 'react'
import * as serviceWorkerRegistration from '../serviceWorkerRegistration'

export const useServiceWorker = () => {
    const [waitingWorker, setWaitingWorker] = useState(null)
    const [showReload, setShowReload] = useState(false)
    const [showReloaded, setShowReloaded] = useState(false)

    const onSWUpdate = useCallback((registration) => {
        setShowReload(true)
        setWaitingWorker(registration.waiting)
    }, [])

    const reloadPage = useCallback(() => {
        waitingWorker?.postMessage({ type: "SKIP_WAITING" })
        setShowReload(false)
        setShowReloaded(true)
        window.location.reload()
    }, [waitingWorker])

    const closePage = useCallback(() => {
        waitingWorker?.postMessage({ type: "SKIP_WAITING" })
        setShowReload(false)
        setShowReloaded(false)
    }, [waitingWorker])

    useEffect(() => {
        serviceWorkerRegistration.register({
            onUpdate: onSWUpdate
        })
    }, [onSWUpdate])

    return { showReload, showReloaded, waitingWorker, reloadPage, closePage }
}