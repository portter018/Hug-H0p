// ใส่ค่าจาก Supabase > Project Settings > API
// anon key ปลอดภัยที่จะอยู่ในโค้ดหน้าเว็บ เพราะความปลอดภัยอยู่ที่ RLS
const SUPABASE_URL = 'https://ctnaecnqcavuaonqjbty.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bmFlY25xY2F2dWFvbnFqYnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDQ2NTEsImV4cCI6MjEwNjE4MDY1MX0.j09hpJqu_SK_dHiHQEzAOZAa3uckmntjJOVTLUpemIs';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);