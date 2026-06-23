"use client";

import { FormEvent, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export type AuthMode = "login" | "signup" | "forgot" | "reset";

function readableError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (/email not confirmed/i.test(message)) {
    return "최초 가입 인증 메일을 먼저 확인해 주세요.";
  }
  if (/user already registered/i.test(message)) {
    return "이미 가입된 이메일입니다. 로그인하거나 비밀번호를 재설정해 주세요.";
  }
  if (/password should be at least/i.test(message)) {
    return "비밀번호는 8자 이상 입력해 주세요.";
  }
  if (/rate limit/i.test(message)) {
    return "요청이 잠시 몰렸습니다. 잠시 후 다시 시도해 주세요.";
  }
  return message;
}

export default function AuthDialog({
  open,
  initialMode = "login",
  onClose,
}: {
  open: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setStatus("");
    setPassword("");
    setPasswordConfirm("");
  }, [initialMode, open]);

  if (!open) return null;

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStatus("");
    setPassword("");
    setPasswordConfirm("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setStatus("");
    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
        return;
      }

      if (mode === "signup") {
        if (password !== passwordConfirm) {
          throw new Error("비밀번호가 서로 일치하지 않습니다.");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/`,
          },
        });
        if (error) throw error;
        setStatus(
          "회원가입 인증 메일을 보냈어요. 메일의 인증 버튼을 누르면 가입이 완료됩니다.",
        );
        return;
      }

      if (mode === "forgot") {
        const next = encodeURIComponent("/?resetPassword=1");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/confirm?next=${next}`,
        });
        if (error) throw error;
        setStatus(
          "재설정 메일을 보냈어요. 메일의 링크를 눌러 새 비밀번호를 등록해 주세요.",
        );
        return;
      }

      if (password !== passwordConfirm) {
        throw new Error("비밀번호가 서로 일치하지 않습니다.");
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      window.history.replaceState({}, "", window.location.pathname);
      setStatus("새 비밀번호가 저장되었습니다.");
      window.setTimeout(onClose, 800);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? readableError(error.message)
          : "인증 요청을 처리하지 못했습니다.",
      );
    } finally {
      setSending(false);
    }
  };

  const resetMode = mode === "reset";
  const title =
    mode === "signup"
      ? "PickPick 회원가입"
      : mode === "forgot"
        ? "비밀번호 재설정"
        : resetMode
          ? "새 비밀번호 등록"
          : "PickPick에 로그인";
  const description =
    mode === "signup"
      ? "이메일을 아이디로 사용합니다. 첫 가입 때만 인증 메일을 확인해 주세요."
      : mode === "forgot"
        ? "가입한 이메일로 비밀번호 재설정 링크를 보내드려요."
        : resetMode
          ? "앞으로 로그인할 때 사용할 새 비밀번호를 입력해 주세요."
          : "이메일과 비밀번호로 바로 로그인하고 대화를 이어갈 수 있어요.";

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/35 px-5 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-[0_30px_100px_rgba(25,18,55,0.28)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="eyebrow">Save your chats</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {description}
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

        {!resetMode && mode !== "forgot" && (
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-zinc-100 p-1">
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => changeMode(item)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === item
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                {item === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="mt-6">
          {!resetMode && (
            <>
              <label
                className="text-xs font-semibold text-zinc-600"
                htmlFor="email"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
              />
            </>
          )}

          {mode !== "forgot" && (
            <div className={resetMode ? "" : "mt-4"}>
              <label
                className="text-xs font-semibold text-zinc-600"
                htmlFor="password"
              >
                {resetMode ? "새 비밀번호" : "비밀번호"}
              </label>
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="8자 이상 입력"
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
              />
            </div>
          )}

          {(mode === "signup" || resetMode) && (
            <div className="mt-4">
              <label
                className="text-xs font-semibold text-zinc-600"
                htmlFor="password-confirm"
              >
                비밀번호 확인
              </label>
              <input
                id="password-confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="비밀번호 다시 입력"
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="mt-5 w-full rounded-2xl bg-ink px-4 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
          >
            {sending
              ? "처리 중..."
              : mode === "signup"
                ? "회원가입 인증 메일 받기"
                : mode === "forgot"
                  ? "재설정 메일 받기"
                  : resetMode
                    ? "새 비밀번호 저장"
                    : "로그인"}
          </button>
        </form>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => changeMode("forgot")}
            className="mt-4 w-full text-center text-xs font-medium text-zinc-500 hover:text-violet-700"
          >
            비밀번호를 잊으셨나요?
          </button>
        )}
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => changeMode("login")}
            className="mt-4 w-full text-center text-xs font-medium text-zinc-500 hover:text-violet-700"
          >
            로그인으로 돌아가기
          </button>
        )}

        {status && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-700"
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
