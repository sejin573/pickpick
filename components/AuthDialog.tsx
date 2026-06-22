"use client";

import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AuthDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setStatus("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      setStatus("로그인 링크를 보냈어요. 이메일을 확인해 주세요.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "로그인 링크를 보내지 못했습니다.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/35 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-[0_30px_100px_rgba(25,18,55,0.28)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="eyebrow">Save your chats</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              PickPick에 로그인
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              이메일로 받은 링크를 누르면 로그인됩니다. 비밀번호는 필요하지
              않아요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
            aria-label="로그인 창 닫기"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-6">
          <label className="text-xs font-semibold text-zinc-600" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
          />
          <button
            type="submit"
            disabled={sending}
            className="mt-3 w-full rounded-2xl bg-ink px-4 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
          >
            {sending ? "보내는 중..." : "이메일로 로그인 링크 받기"}
          </button>
        </form>
        {status && (
          <p className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-700">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
