import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { formatDateTime } from "@/lib/format";
import { IDEA_KINDS } from "@/lib/ideas";
import {
  getIdeaFeeds,
  ideaChannelId,
  ideaPostingEnabled,
  type IdeaFeed,
  type IdeaFeedProblem,
} from "@/services/discord/ideas";
import { AdminNotice, AdminPageHeader, AdminPanel, StatusBadge } from "@/components/admin/admin-ui";
import { ApprovalButton } from "./approval-button";

export const metadata: Metadata = { title: "Ideen · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const PROBLEMS: Record<IdeaFeedProblem, string> = {
  "kein-token": "Der Bot-Token fehlt (DISCORD_BOT_TOKEN). Ohne ihn kann die Seite den Kanal nicht lesen.",
  "kein-kanal":
    "Noch kein Kanal eingetragen. Setz DISCORD_HIGHLIGHTS_CHANNEL_ID auf die ID des Highlights-Kanals und starte die Seite neu. Bis dahin zeigt /highlights nur einen Hinweis.",
  "kein-zugriff":
    "Der Bot darf diesen Kanal nicht lesen. Gib ihm dort „Kanal ansehen“ und „Nachrichtenverlauf lesen“.",
  fehler: "Discord ist gerade nicht erreichbar. Versuch es gleich noch einmal.",
};

/**
 * Vorschläge, Playlist-Ideen und Highlights aus dem Discord. Alles hier ist
 * erst einmal nur im Admin zu sehen; auf /mitmachen bzw. /highlights steht
 * ein Eintrag erst nach Freigabe.
 */
export default async function AdminIdeasPage() {
  // Ein ausgeblendeter Menüpunkt ist kein Schutz — die Seite prüft selbst.
  await requireCan("article", ["publish"]);

  const feeds = await getIdeaFeeds({ fresh: true });
  const unreadable = feeds.reduce((sum, feed) => sum + feed.unreadable, 0);

  return (
    <>
      <AdminPageHeader
        title="Ideen"
        description="Vorschläge, Playlist-Ideen und Highlights aus dem Discord. Auf /mitmachen und /highlights steht nur, was du freigibst."
      />

      {unreadable > 0 && (
        <AdminNotice title="Manche Nachrichten kommen ohne Text an">
          {unreadable === 1 ? "Eine Nachricht" : `${unreadable} Nachrichten`} lieferte Discord leer aus.
          Dann fehlt dem Bot meist der „Message Content Intent“: im Discord Developer Portal
          unter Bot → Privileged Gateway Intents einschalten.
        </AdminNotice>
      )}

      {!ideaPostingEnabled() && (
        <AdminNotice title="Testseite">
          Das Formular auf /mitmachen schickt nur auf voltfm.xyz etwas in den Discord. Hier
          wird gelesen, aber nichts gesendet.
        </AdminNotice>
      )}

      <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2">
        {feeds.map((feed) => (
          <FeedPanel key={feed.kind} feed={feed} />
        ))}
      </div>
    </>
  );
}

function FeedPanel({ feed }: { feed: IdeaFeed }) {
  const shown = feed.ideas.filter((idea) => idea.approved).length;
  const channel = ideaChannelId(feed.kind);
  const page = feed.kind === "highlight" ? "/highlights" : "/mitmachen";

  return (
    <AdminPanel
      title={IDEA_KINDS[feed.kind].plural}
      titleId={`ideen-${feed.kind}`}
      description={
        channel ? `Kanal ${channel}, ${shown} auf ${page}` : `Kein Kanal eingetragen, ${page} bleibt leer`
      }
      bodyClassName="p-0"
    >
      {feed.problem ? (
        <p className="m-4 well rounded-[var(--radius)] px-4 py-5 text-sm text-muted">{PROBLEMS[feed.problem]}</p>
      ) : feed.ideas.length === 0 ? (
        <p className="m-4 well rounded-[var(--radius)] px-4 py-5 text-sm text-muted">Hier ist noch nichts.</p>
      ) : (
        <ul className="divide-y divide-separator">
          {feed.ideas.map((idea) => (
            <li
              key={idea.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-wide text-sm font-bold text-foreground">{idea.author}</span>
                  <span className="font-mono text-[0.7rem] text-muted">{formatDateTime(idea.createdAt)}</span>
                  {idea.viaWebsite && <StatusBadge>über die Website</StatusBadge>}
                  {idea.approved && <StatusBadge color="success">auf der Seite</StatusBadge>}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed break-words whitespace-pre-line text-foreground/90">
                  {idea.text}
                </p>
              </div>
              <ApprovalButton id={idea.id} kind={idea.kind} approved={idea.approved} />
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}
