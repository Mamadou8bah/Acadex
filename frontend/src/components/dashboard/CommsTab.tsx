import type { FormEvent } from "react";
import type { Announcement } from "../../types";
import { createAnnouncement, createInAppNotification, sendMessage, type MessageItem, type NotificationItem } from "../../features/platform/api";
import { Items, Panel } from "./shared";

interface Session {
  accessToken: string;
  tenantId: string;
}

interface CommsTabProps {
  session: Session;
  isSchoolAdmin: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  announcements: Announcement[];
  notifications: NotificationItem[];
  messages: MessageItem[];
  handle: (
    event: FormEvent<HTMLFormElement>,
    action: (fd: FormData) => Promise<unknown>,
    refresh?: string[],
    success?: string
  ) => Promise<void>;
}

export function CommsTab({
  session,
  isSchoolAdmin,
  isSuperAdmin,
  isTeacher,
  isStudent,
  announcements,
  notifications,
  messages,
  handle
}: CommsTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel subtitle="Notifications" title="Announcements and alerts">
        <Items values={(notifications ?? []).map((item) => [item.subject, item.status].join(" • "))} />
        <Items values={(announcements ?? []).slice(0, 4).map((item) => [item.title, item.audience].join(" • "))} />
        {isSchoolAdmin || isSuperAdmin || isTeacher ? (
          <>
            {(isSchoolAdmin || isSuperAdmin) ? (
              <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createAnnouncement(session, {
                title: String(fd.get("title")),
                content: String(fd.get("content")),
                audience: String(fd.get("audience")),
                classId: String(fd.get("classId") || "") || undefined
              }), ["announcements"], "Announcement created.")}>
                <input className="w-full rounded-2xl border border-black/10 p-3" name="title" placeholder="Announcement title" />
                <textarea className="w-full rounded-2xl border border-black/10 p-3" name="content" placeholder="Content" rows={4} />
                <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="SCHOOL_WIDE" name="audience">
                  <option>SCHOOL_WIDE</option>
                  <option>TEACHERS</option>
                  <option>STUDENTS</option>
                  <option>PARENTS</option>
                  <option>CLASS_SPECIFIC</option>
                </select>
                <input className="w-full rounded-2xl border border-black/10 p-3" name="classId" placeholder="Class ID (required for class-specific)" />
                <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create announcement</button>
              </form>
            ) : null}
            <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createInAppNotification(session, {
              recipientUserId: String(fd.get("recipientUserId")),
              subject: String(fd.get("subject")),
              content: String(fd.get("content"))
            }), ["notifications"], "In-app notification queued.")}>
              <input className="w-full rounded-2xl border border-black/10 p-3" name="recipientUserId" placeholder="Recipient user ID" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="subject" placeholder="Subject" />
              <textarea className="w-full rounded-2xl border border-black/10 p-3" name="content" placeholder="Content" rows={3} />
              <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Send notification</button>
            </form>
          </>
        ) : (
          <p className="text-sm leading-7 text-black/70">
            This role can review its own announcements and notifications but cannot publish school-wide alerts.
          </p>
        )}
      </Panel>

      <Panel subtitle="Conversations" title="Messages">
        <Items values={(messages ?? []).map((item) => [item.senderUserId, item.recipientUserId, item.body].join(" • "))} />
        {isStudent ? (
          <p className="text-sm leading-7 text-black/70">
            Student messaging is currently view-only. Teacher, parent, and admin roles can send new messages.
          </p>
        ) : (
          <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => sendMessage(session, {
            recipientUserId: String(fd.get("recipientUserId")),
            body: String(fd.get("body"))
          }), ["messages"], "Message sent.")}>
            <input className="w-full rounded-2xl border border-black/10 p-3" name="recipientUserId" placeholder="Recipient user ID" />
            <textarea className="w-full rounded-2xl border border-black/10 p-3" name="body" placeholder="Message body" rows={4} />
            <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Send message</button>
          </form>
        )}
      </Panel>
    </div>
  );
}
