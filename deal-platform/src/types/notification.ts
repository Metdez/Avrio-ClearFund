export interface Notification {
  id: string;
  type: "OverdueTask" | "CPResponse" | "FollowUpReminder" | "DealStageChange";
  title: string;
  body: string;
  linkUrl: string;
  isRead: boolean;
  recipientUserId: string;
  createdAt: string;
}
