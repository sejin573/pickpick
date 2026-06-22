"use client";

import { User } from "@supabase/supabase-js";
import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import AgentSteps from "@/components/AgentSteps";
import AnalysisPanel from "@/components/AnalysisPanel";
import AssistantMessage from "@/components/AssistantMessage";
import AuthDialog from "@/components/AuthDialog";
import BuyingGuide from "@/components/BuyingGuide";
import ChatSidebar from "@/components/ChatSidebar";
import ChatProgress from "@/components/ChatProgress";
import ComparisonTable from "@/components/ComparisonTable";
import Hero from "@/components/Hero";
import RecommendationCards from "@/components/RecommendationCards";
import ServiceInfo from "@/components/ServiceInfo";
import { createClient } from "@/lib/supabase/client";
import {
  ConversationSummary,
  RecommendResponse,
  StoredConversation,
} from "@/lib/types";

function ChatItem({
  delay = 0,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = itemRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.08,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={itemRef}
      className={visible ? "scroll-reveal is-visible" : "scroll-reveal"}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null,
  );
  const resultRef = useRef<HTMLDivElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      requestControllerRef.current?.abort();
    },
    [],
  );

  const loadConversations = useCallback(async () => {
    if (!supabaseConfigured) return;
    setConversationsLoading(true);
    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      if (!response.ok) {
        if (response.status === 401) setConversations([]);
        return;
      }
      const data = (await response.json()) as {
        conversations: ConversationSummary[];
      };
      setConversations(data.conversations);
    } finally {
      setConversationsLoading(false);
    }
  }, [supabaseConfigured]);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setConversations([]);
        setActiveConversationId(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabaseConfigured]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  const selectPrompt = (prompt: string) => {
    setMessage(prompt);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetToHome = () => {
    requestIdRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setResult(null);
    setMessage("");
    setSubmittedMessage("");
    setError("");
    setLoading(false);
    setActiveConversationId(null);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveConversation = async (
    userMessage: string,
    responseData: RecommendResponse,
  ) => {
    if (!user || !supabaseConfigured) return;
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: userMessage.slice(0, 60),
        userMessage,
        response: responseData,
      }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as {
      conversation: ConversationSummary;
    };
    setActiveConversationId(data.conversation.id);
    setConversations((current) => [
      data.conversation,
      ...current.filter((item) => item.id !== data.conversation.id),
    ]);
  };

  const requestRecommendation = async () => {
    if (loading) return;
    const trimmed = message.trim();
    if (!trimmed) {
      setError("추천받고 싶은 대상, 상황 또는 예산을 한 문장으로 입력해 주세요.");
      return;
    }

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestControllerRef.current = controller;
    requestIdRef.current = requestId;

    setLoading(true);
    setSubmittedMessage(trimmed);
    setResult(null);
    setError("");
    window.setTimeout(
      () => resultRef.current?.scrollIntoView({ behavior: "smooth" }),
      120,
    );
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      });
      const data = (await response.json()) as RecommendResponse & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error ?? "추천 결과를 불러오지 못했습니다.");
      if (requestId !== requestIdRef.current) return;
      setResult(data);
      await saveConversation(trimmed, data);
    } catch (caught) {
      if (
        controller.signal.aborted ||
        requestId !== requestIdRef.current
      ) {
        return;
      }
      setError(
        caught instanceof Error ? caught.message : "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        requestControllerRef.current = null;
        setLoading(false);
      }
    }
  };

  const showConversation = Boolean(result || loading || submittedMessage);
  const meta = result?.meta;

  const openConversation = async (id: string) => {
    setSidebarOpen(false);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        conversation?: StoredConversation;
        error?: string;
      };
      if (!response.ok || !data.conversation) {
        throw new Error(data.error ?? "대화를 불러오지 못했습니다.");
      }
      setSubmittedMessage(data.conversation.userMessage);
      setMessage(data.conversation.userMessage);
      setResult(data.conversation.response);
      setActiveConversationId(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "대화를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renameConversation = async (conversation: ConversationSummary) => {
    const title = window.prompt("새 대화 제목", conversation.title)?.trim();
    if (!title || title === conversation.title) return;
    const response = await fetch(`/api/conversations/${conversation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (response.ok) {
      setConversations((current) =>
        current.map((item) =>
          item.id === conversation.id ? { ...item, title } : item,
        ),
      );
    }
  };

  const deleteConversation = async (id: string) => {
    if (!window.confirm("이 대화를 삭제할까요?")) return;
    const response = await fetch(`/api/conversations/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    setConversations((current) => current.filter((item) => item.id !== id));
    if (activeConversationId === id) resetToHome();
  };

  const logout = async () => {
    if (!supabaseConfigured) return;
    await createClient().auth.signOut();
    resetToHome();
  };

  return (
    <>
      <ChatSidebar
        open={sidebarOpen}
        configured={supabaseConfigured}
        user={user}
        conversations={conversations}
        activeId={activeConversationId}
        loading={conversationsLoading}
        onClose={() => setSidebarOpen(false)}
        onNewChat={resetToHome}
        onLogin={() => setAuthOpen(true)}
        onLogout={logout}
        onOpenConversation={openConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
      />
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-xl border border-white bg-white/90 text-lg shadow-soft backdrop-blur lg:hidden"
        aria-label="대화 목록 열기"
      >
        ☰
      </button>
      <main
        className={`min-h-screen pt-16 transition-[padding] lg:pl-[286px] lg:pt-8 ${
          showConversation ? "pb-44 sm:pb-48" : "pb-16"
        }`}
      >
      <div className="page-shell">
        <Hero
          message={message}
          loading={loading}
          error={error}
          compact={showConversation}
          onReset={resetToHome}
          onMessageChange={setMessage}
          onSubmit={requestRecommendation}
        />

        <div ref={resultRef} className="mt-8 space-y-6 sm:mt-10">
          {submittedMessage && (
            <ChatItem>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-violet-600 px-4 py-3 text-[15px] leading-6 text-white shadow-sm sm:max-w-[70%]">
                  {submittedMessage}
                </div>
              </div>
            </ChatItem>
          )}

          {(loading || result) && (
            <ChatItem delay={0.08}>
              <ChatProgress complete={!loading && Boolean(result)} />
            </ChatItem>
          )}

          {result && (
            <>
              {meta && (
                <ChatItem delay={0.18}>
                  <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          meta.catalogProvider === "naver"
                            ? "bg-emerald-500"
                            : "bg-violet-500"
                        }`}
                      />
                      {meta.catalogLabel ?? "PickPick 상품 데이터"}
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="tracking-wider">
                      CATALOG {(meta.catalogProvider ?? "sample").toUpperCase()}
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="tracking-wider">
                      AGENT {(meta.selectionMode ?? "rules").toUpperCase()}
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="tracking-wider">
                      PLAN{" "}
                      {(meta.queryPlanningMode ?? "rules").toUpperCase()}
                    </span>
                  </p>
                </ChatItem>
              )}

              {meta?.notice && (
                <ChatItem delay={0.24}>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                    {meta.notice}
                  </div>
                </ChatItem>
              )}

              <ChatItem delay={0.3}>
                <AnalysisPanel analysis={result.analysis} />
              </ChatItem>
              <ChatItem delay={0.42}>
                <AssistantMessage wide>
                  <RecommendationCards
                    recommendations={result.recommendations}
                    groups={result.recommendationGroups}
                    priceBands={result.priceBands}
                  />
                </AssistantMessage>
              </ChatItem>
              <ChatItem delay={0.54}>
                <AssistantMessage wide>
                  <AgentSteps steps={result.agentSteps} />
                </AssistantMessage>
              </ChatItem>
              <ChatItem delay={0.66}>
                <AssistantMessage wide>
                  <ComparisonTable items={result.comparison} />
                </AssistantMessage>
              </ChatItem>
              <ChatItem delay={0.78}>
                <AssistantMessage wide>
                  <BuyingGuide guide={result.buyingGuide} />
                </AssistantMessage>
              </ChatItem>
              <ChatItem delay={0.9}>
                <AssistantMessage wide>
                  <ServiceInfo onSelect={selectPrompt} meta={result.meta} />
                </AssistantMessage>
              </ChatItem>
            </>
          )}
        </div>

        {!showConversation && (
          <footer className="-mt-12 pb-3 text-center text-xs leading-5 text-zinc-500">
            <p className="font-semibold text-zinc-700">PickPick</p>
            <p className="mt-1">
              상품 선택의 부담을 줄이는 상황 기반 AI 커머스 에이전트 프로토타입
            </p>
            <p className="mt-2 text-[11px] font-medium text-zinc-400">
              Created by sejin573 (장세진)
            </p>
            <p className="mt-1 font-mono text-[10px] text-zinc-400">
              v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"} ·{" "}
              {process.env.NEXT_PUBLIC_BUILD_SHA ?? "local"} ·{" "}
              {(process.env.NEXT_PUBLIC_BUILD_TIME ?? "")
                .slice(0, 16)
                .replace("T", " ")}
            </p>
          </footer>
        )}
      </div>
      </main>
    </>
  );
}
