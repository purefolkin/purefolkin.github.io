"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export async function signIn(formData:FormData){const email=String(formData.get("email")??"").trim();const password=String(formData.get("password")??"");if(!email||!password)redirect("/admin/login?error=missing");const db=await createSupabaseServerClient();if(!db)redirect("/admin/login?error=configuration");const {error}=await db.auth.signInWithPassword({email,password});if(error)redirect("/admin/login?error=credentials");redirect("/admin");}
