import { MiniKit, Permission, RequestPermissionPayload } from "@worldcoin/minikit-js";

import { useCallback, useEffect, useState } from "react";
export type NotificationStatus = "Accepted" | "Denied" | null;
  
export const API_BASE_URL = "https://notifications-prefrences.fly.dev";
const appId = "BORROW";


interface NotificationPreferencesInput {
  user_address: string;
  app_id: string;
  hasNotificationsEnabled: boolean;
  hasRejectedNotifications: boolean;
}

export function useNotifications(userAddress: string | null) {
  const [notificationStatus, setNotificationStatus] =
    useState<NotificationStatus>(null);
  
  useEffect(() => {
    const status = localStorage.getItem(
      "notificationStatus"
    ) as NotificationStatus;
    if (status) {
      setNotificationStatus(status);
    }
  }, []);
  
  const requestPermission = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      throw new Error("MiniKit not installed");
    }
    if (!userAddress) {
      throw new Error("User address is null");
    }
    const requestPermissionPayload: RequestPermissionPayload = {
      permission: Permission.Notifications,
    };
    const result = await MiniKit.commandsAsync.requestPermission(
      requestPermissionPayload
    );

    const { finalPayload } = result;
  
    const status: NotificationStatus = finalPayload.status !== "error" ? "Accepted" : "Denied";
  
    localStorage.setItem("notificationStatus", status);
    setNotificationStatus(status);

    // Send API request regardless of status
    console.log("Sending notification preferences to API...");
    try {
      const prefs: NotificationPreferencesInput = {
        user_address: userAddress,
        app_id: appId,
        hasNotificationsEnabled: status === "Accepted",
        hasRejectedNotifications: status === "Denied",
      };

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prefs),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error(`API Error (${response.status}):`, responseData);
        return { result: false };
      }

      console.log(`API Success (${response.status}):`, responseData);
    } catch (error) {
      console.error("Failed to send notification preferences:", error);
      return { result: false };
    }
  
    return { result };
  }, [userAddress]);
  
  return { requestPermission, notificationStatus };
}
