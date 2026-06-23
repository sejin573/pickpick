import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { RecommendResponse } from "@/lib/types";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ conversations: [] });
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id,title,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[conversations] list failed", error);
    return NextResponse.json(
      { error: "대화 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    conversations: (data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
  });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "대화 저장 기능이 아직 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as {
    conversationId?: string;
    title?: string;
    userMessage?: string;
    response?: RecommendResponse;
  };
  const userMessage = body.userMessage?.trim();
  if (!userMessage || !body.response) {
    return NextResponse.json(
      { error: "저장할 대화 내용이 없습니다." },
      { status: 400 },
    );
  }

  const title = (body.title?.trim() || userMessage).slice(0, 60);
  const savedAt = new Date().toISOString();
  const existingConversationId = body.conversationId?.trim();
  const conversationQuery = existingConversationId
    ? supabase
        .from("conversations")
        .update({ updated_at: savedAt })
        .eq("id", existingConversationId)
        .eq("user_id", userId)
        .select("id,title,created_at,updated_at")
        .single()
    : supabase
        .from("conversations")
        .insert({ user_id: userId, title })
        .select("id,title,created_at,updated_at")
        .single();
  const { data: conversation, error: conversationError } =
    await conversationQuery;

  if (conversationError || !conversation) {
    console.error("[conversations] create failed", conversationError);
    return NextResponse.json(
      { error: "대화를 저장하지 못했습니다." },
      { status: 500 },
    );
  }

  const { data: userMessageRow, error: userMessageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      user_id: userId,
      role: "user",
      content: userMessage,
    })
    .select("id")
    .single();
  const { error: assistantMessageError } = userMessageError
    ? { error: userMessageError }
    : await supabase.from("messages").insert({
      conversation_id: conversation.id,
      user_id: userId,
      role: "assistant",
      content: "PickPick 추천 결과",
      payload: {
        snapshotVersion: 1,
        savedAt,
        response: body.response,
      },
    });

  if (userMessageError || assistantMessageError) {
    if (userMessageRow?.id) {
      await supabase.from("messages").delete().eq("id", userMessageRow.id);
    }
    if (!existingConversationId) {
      await supabase.from("conversations").delete().eq("id", conversation.id);
    }
    console.error(
      "[conversations] message create failed",
      userMessageError ?? assistantMessageError,
    );
    return NextResponse.json(
      { error: "대화 메시지를 저장하지 못했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        savedAt,
      },
    },
    { status: existingConversationId ? 200 : 201 },
  );
}
