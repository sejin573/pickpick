"use client";

import { User } from "@supabase/supabase-js";

import { ConversationSummary } from "@/lib/types";

export default function ChatSidebar({
  open,
  configured,
  user,
  conversations,
  activeId,
  loading,
  onClose,
  onNewChat,
  onLogin,
  onLogout,
  onOpenConversation,
  onRenameConversation,
  onDeleteConversation,
}: {
  open: boolean;
  configured: boolean;
  user: User | null;
  conversations: ConversationSummary[];
  activeId: string | null;
  loading: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onOpenConversation: (id: string) => void;
  onRenameConversation: (conversation: ConversationSummary) => void;
  onDeleteConversation: (id: string) => void;
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="사이드바 닫기"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-violet-100 bg-[#f6f3ff] p-3 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-2"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm font-bold text-white">
              P
            </span>
            <span className="font-semibold tracking-tight">PickPick</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-white lg:hidden"
            aria-label="사이드바 닫기"
          >
            ×
          </button>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-violet-400 hover:text-violet-700"
        >
          <span className="text-lg leading-none">＋</span> 새 대화
        </button>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            Recent chats
          </p>
          {!user ? (
            <div className="mt-3 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-zinc-500">
              로그인하면 추천 대화가 여기에 자동으로 저장됩니다.
            </div>
          ) : loading ? (
            <p className="mt-3 px-2 text-sm text-zinc-400">불러오는 중...</p>
          ) : conversations.length === 0 ? (
            <p className="mt-3 px-2 text-sm leading-6 text-zinc-400">
              아직 저장된 대화가 없습니다.
            </p>
          ) : (
            <ul className="mt-2 space-y-1">
              {conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className={`group flex items-center rounded-xl transition ${
                    activeId === conversation.id
                      ? "bg-white shadow-sm"
                      : "hover:bg-white/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onOpenConversation(conversation.id)}
                    className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm text-zinc-700"
                    title={conversation.title}
                  >
                    {conversation.title}
                  </button>
                  <div className="mr-1 hidden items-center group-hover:flex">
                    <button
                      type="button"
                      onClick={() => onRenameConversation(conversation)}
                      className="grid h-7 w-7 place-items-center rounded-md text-xs text-zinc-400 hover:bg-violet-50 hover:text-violet-700"
                      aria-label="대화 제목 변경"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteConversation(conversation.id)}
                      className="grid h-7 w-7 place-items-center rounded-md text-xs text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="대화 삭제"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-violet-100 pt-3">
          {!configured ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
              Supabase 환경 변수를 등록하면 로그인과 대화 저장이 활성화됩니다.
            </p>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                {(user.email?.[0] ?? "U").toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-zinc-600">
                {user.email}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:bg-white hover:text-zinc-800"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              로그인하고 대화 저장
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
