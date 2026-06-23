import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { RecommendResponse } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };
type StoredSnapshot = {
  snapshotVersion: number;
  savedAt: string;
  response: RecommendResponse;
};

function isStoredSnapshot(payload: unknown): payload is StoredSnapshot {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Partial<StoredSnapshot>;
  return Boolean(
    candidate.snapshotVersion &&
      candidate.savedAt &&
      candidate.response &&
      typeof candidate.response === "object",
  );
}

export async function GET(_: Request, context: Context) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }
  const { id } = await context.params;
  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("id,title,created_at,updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !conversation) {
    return NextResponse.json({ error: "대화를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("role,content,payload,created_at")
    .eq("conversation_id", id)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (messagesError) {
    return NextResponse.json({ error: "메시지를 불러오지 못했습니다." }, { status: 500 });
  }

  const turns = [];
  let pendingUserMessage: {
    content: string;
    created_at: string;
  } | null = null;
  for (const message of messages ?? []) {
    if (message.role === "user") {
      pendingUserMessage = {
        content: message.content,
        created_at: message.created_at,
      };
      continue;
    }
    if (!pendingUserMessage || !message.payload) continue;
    const snapshot = isStoredSnapshot(message.payload)
      ? message.payload
      : {
          snapshotVersion: 0,
          savedAt: message.created_at,
          response: message.payload as RecommendResponse,
        };
    turns.push({
      id: `${message.created_at}-${turns.length}`,
      userMessage: pendingUserMessage.content,
      response: snapshot.response,
      snapshotVersion: snapshot.snapshotVersion,
      savedAt: snapshot.savedAt,
    });
    pendingUserMessage = null;
  }
  if (turns.length === 0) {
    return NextResponse.json({ error: "저장된 대화가 올바르지 않습니다." }, { status: 500 });
  }

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      turns,
    },
  });
}

export async function PATCH(request: Request, context: Context) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }
  const { id } = await context.params;
  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const body = (await request.json()) as { title?: string };
  const title = body.title?.trim().slice(0, 120);
  if (!title) {
    return NextResponse.json({ error: "대화 제목을 입력해 주세요." }, { status: 400 });
  }

  const { error } = await supabase
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    return NextResponse.json({ error: "제목을 변경하지 못했습니다." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: Context) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }
  const { id } = await context.params;
  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    return NextResponse.json({ error: "대화를 삭제하지 못했습니다." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
