import { supabaseServer } from "@/lib/supabaseServer";

export async function findOrCreateLeadByPhone(phone) {
  // 1) buscar
  const { data: existing, error: findError } = await supabaseServer
    .from("leads")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  // 2) crear
  const { data: created, error: createError } = await supabaseServer
    .from("leads")
    .insert({ phone })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}
