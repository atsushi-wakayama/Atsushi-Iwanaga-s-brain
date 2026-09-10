"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireOwner(mapId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data: membership } = await supabase
    .from("map_members")
    .select("role")
    .eq("map_id", mapId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.role !== "owner") {
    throw new Error("この操作は案件のオーナーのみ実行できます");
  }
  return { supabase, user };
}

export async function inviteMember(formData: FormData) {
  const mapId = String(formData.get("mapId") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "editor");
  if (!mapId || !email) return;

  const { supabase, user } = await requireOwner(mapId);
  const { error } = await supabase.from("map_invites").upsert(
    {
      map_id: mapId,
      email,
      role: role === "viewer" ? "viewer" : "editor",
      invited_by: user.id,
      accepted_at: null,
    },
    { onConflict: "map_id,email" },
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/m/${mapId}/share`);
}

export async function cancelInvite(formData: FormData) {
  const mapId = String(formData.get("mapId") ?? "");
  const inviteId = String(formData.get("inviteId") ?? "");
  const { supabase } = await requireOwner(mapId);

  await supabase.from("map_invites").delete().eq("id", inviteId);
  revalidatePath(`/m/${mapId}/share`);
}

export async function removeMember(formData: FormData) {
  const mapId = String(formData.get("mapId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const { supabase } = await requireOwner(mapId);

  await supabase
    .from("map_members")
    .delete()
    .eq("map_id", mapId)
    .eq("user_id", userId)
    .neq("role", "owner");

  revalidatePath(`/m/${mapId}/share`);
}

export async function createShareLink(formData: FormData) {
  const mapId = String(formData.get("mapId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const days = Number(formData.get("days") ?? 0);
  const { supabase, user } = await requireOwner(mapId);

  const expiresAt =
    days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;

  const { error } = await supabase.from("share_links").insert({
    token: randomBytes(18).toString("base64url"),
    map_id: mapId,
    label: label || null,
    expires_at: expiresAt,
    created_by: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/m/${mapId}/share`);
}

export async function revokeShareLink(formData: FormData) {
  const mapId = String(formData.get("mapId") ?? "");
  const token = String(formData.get("token") ?? "");
  const { supabase } = await requireOwner(mapId);

  await supabase
    .from("share_links")
    .update({ revoked: true })
    .eq("token", token)
    .eq("map_id", mapId);

  revalidatePath(`/m/${mapId}/share`);
}
