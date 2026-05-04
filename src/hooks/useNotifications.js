import { useCallback } from "react";
import { usePersistentState } from "./UsePersistentState";
import { useServiceWorker } from "../contextProviders/ServiceWorkerContext";
import { useSnackbar } from "notistack";
import { useOnlineStatus } from "../contextProviders/OnlineContext";
import { useEffect } from "react";
import { Button } from "react-bootstrap";
import { appUpdates } from "../data/appUpdates";
import moment from "moment";

/**
 * Hook that manages all notification-related state and API calls.
 *
 * Owns: systemMessage, systemBell, eventMessage, eventBell, showReloaded state
 *       + putNotifications, putEventNotifications, getNotifications,
 *         getEventNotifications, getSystemMessages, getEventMessages
 *       + service-worker update snackbar effects
 *
 * @param {object} params
 * @param {object} params.httpClient - API client for making requests
 * @param {object} params.selectedEvent - Currently selected event
 * @param {boolean} params.useFTCOffline - Whether FTC offline mode is enabled
 * @param {boolean} params.manualOfflineMode - Whether manual offline mode is active
 */
export function useNotifications({
  httpClient,
  selectedEvent,
  useFTCOffline,
  manualOfflineMode,
}) {
  const isOnline = useOnlineStatus();
  const { waitingWorker, showReload, reloadPage } = useServiceWorker();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Notification state
  const [showReloaded, setShowReloaded] = usePersistentState(
    "cache:showReloaded",
    false
  );
  const [systemMessage, setSystemMessage] = usePersistentState(
    "setting:systemMessage",
    null
  );
  const [systemBell, setSystemBell] = usePersistentState(
    "setting:systemBell",
    ""
  );
  const [eventMessage, setEventMessage] = usePersistentState(
    "setting:eventMessage",
    []
  );
  const [eventBell, setEventBell] = usePersistentState(
    "setting:eventBell",
    []
  );

  // --- Service worker update snackbars ---

  // Display an alert when there are updates to the app
  useEffect(() => {
    const reload = () => {
      setShowReloaded(true);
      reloadPage();
    };

    if (showReload && waitingWorker) {
      enqueueSnackbar("A new version was released.", {
        persist: true,
        variant: "success",
        action: (
          <>
            <Button
              className="snackbar-button"
              color="primary"
              onClick={reload}
            >
              Reload and Update
            </Button>
          </>
        ),
      });
    }
  }, [waitingWorker, showReload, setShowReloaded, reloadPage, enqueueSnackbar]);

  // Display update details after reload
  useEffect(() => {
    const closeSnackBar = () => {
      setShowReloaded(false);
      closeSnackbar();
    };

    if (showReloaded) {
      enqueueSnackbar(
        <div>
          A new version was released. Here's what changed on{" "}
          {appUpdates[0].date}:<br />
          {appUpdates[0].message}
        </div>,
        {
          persist: false,
          autoHideDuration: 7500,
          variant: "success",
          action: (
            <>
              <Button
                className="snackbar-button"
                color="primary"
                onClick={closeSnackBar}
              >
                Return to Announcing
              </Button>
            </>
          ),
        }
      );
    }
  }, [showReloaded, setShowReloaded, enqueueSnackbar, closeSnackbar]);

  // --- API functions ---

  const putNotifications = useCallback(
    async (data) => {
      var result = await httpClient.put(`system/announcements`, data);
      return result;
    },
    [httpClient]
  );

  const putEventNotifications = useCallback(
    async (data) => {
      var result = await httpClient.put(
        `system/announcements/${selectedEvent?.value?.code}`,
        data
      );
      return result;
    },
    [httpClient, selectedEvent]
  );

  const getNotifications = useCallback(async () => {
    var result = await httpClient.getNoAuth(`announcements`);
    if (result.status === 200) {
      try {
        var notifications = await result.json();
        return notifications != null
          ? notifications
          : {
              message: "",
              onTime: "",
              offTime: "",
              onDate: "",
              offDate: "",
              variant: "",
              link: "",
            };
      } catch (e) {
        return {
          message: "",
          onTime: "",
          offTime: "",
          onDate: "",
          offDate: "",
          variant: "",
          link: "",
        };
      }
    } else if (result.status === 204) {
      return {
        message: "",
        onTime: "",
        offTime: "",
        onDate: "",
        offDate: "",
        variant: "",
        link: "",
      };
    } else {
      return {
        message: `**Error** ${result?.statusText || "unknown"}`,
        onTime: null,
        offTime: null,
        onDate: null,
        offDate: null,
        variant: "danger",
      };
    }
  }, [httpClient]);

  const getEventNotifications = useCallback(async () => {
    if (!selectedEvent?.value?.code) {
      return [];
    }
    var result = await httpClient.getNoAuth(
      `announcements/${selectedEvent?.value?.code}`
    );

    if (result.status === 200) {
      try {
        var notifications = await result.json();
        if (Array.isArray(notifications)) {
          return notifications;
        }
        if (notifications && Array.isArray(notifications.announcements)) {
          return notifications.announcements;
        }
        if (notifications && typeof notifications === "object") {
          return [notifications];
        }
        return [];
      } catch (e) {
        return [];
      }
    } else if (result.status === 204) {
      return [];
    } else if (result.status === 404) {
      return [
        {
          message: `**Error** ${result?.statusText || "not found"}`,
          onTime: null,
          offTime: null,
          onDate: null,
          offDate: null,
          variant: "danger",
          user: null,
        },
      ];
    } else if (result.status === 408) {
      return [];
    } else {
      return [
        {
          message: `**Error** ${result?.statusText || "unknown"}`,
          onTime: null,
          offTime: null,
          onDate: null,
          offDate: null,
          variant: "danger",
          user: null,
        },
      ];
    }
  }, [httpClient, selectedEvent]);

  // --- Higher-level message fetchers ---

  const getSystemMessages = useCallback(async () => {
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log(
        "FTC Offline mode: Skipping System Messages API call while offline" +
          (manualOfflineMode ? " (manual override)" : "")
      );
      return;
    }

    var message = await getNotifications();
    if (message?.message.includes("**Error**")) {
      console.log(message?.message);
    } else {
      var formattedMessage = {
        message: message?.message,
        expiry: moment(`${message?.offDate} ${message?.offTime}`),
        onTime: moment(`${message?.onDate} ${message?.onTime}`),
        variant: message?.variant || "",
        link: message?.link || "",
      };
      if (JSON.stringify(formattedMessage) !== JSON.stringify(systemMessage)) {
        setSystemBell("");
        setSystemMessage(formattedMessage);
      }
    }
  }, [
    useFTCOffline,
    isOnline,
    manualOfflineMode,
    getNotifications,
    systemMessage,
    setSystemBell,
    setSystemMessage,
  ]);

  const getEventMessages = useCallback(async () => {
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log(
        "FTC Offline mode: Skipping Event Messages API call while offline" +
          (manualOfflineMode ? " (manual override)" : "")
      );
      return;
    }

    var message = await getEventNotifications();
    const list = Array.isArray(message) ? message : [];
    const isErrorResponse =
      list.length > 0 && list[0]?.message?.includes?.("**Error**");
    if (isErrorResponse) {
      console.log(`No Event Messages found for ${selectedEvent?.label}`);
      setEventMessage([]);
      return;
    }

    var formattedMessage = list.map((item) => {
      const onM =
        item?.onDate != null && item?.onTime != null
          ? moment(`${item.onDate} ${item.onTime}`)
          : moment();
      const offM =
        item?.offDate != null && item?.offTime != null
          ? moment(`${item.offDate} ${item.offTime}`)
          : moment().add(1, "days");
      return {
        message: item?.message ?? "",
        expiry: offM,
        onTime: onM,
        variant: item?.variant || "primary",
        user: item?.user ?? null,
        link: item?.link ?? "",
      };
    });
    setEventMessage(formattedMessage);
  }, [
    useFTCOffline,
    isOnline,
    manualOfflineMode,
    getEventNotifications,
    selectedEvent,
    setEventMessage,
  ]);

  return {
    // State
    systemMessage,
    setSystemMessage,
    systemBell,
    setSystemBell,
    eventMessage,
    setEventMessage,
    eventBell,
    setEventBell,
    showReloaded,
    setShowReloaded,
    // API functions
    putNotifications,
    putEventNotifications,
    getNotifications,
    getEventNotifications,
    // Message fetchers
    getSystemMessages,
    getEventMessages,
    // Service worker
    reloadPage,
  };
}
