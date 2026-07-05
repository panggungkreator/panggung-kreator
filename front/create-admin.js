const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');

// Load environment variables dari folder front (tempat .env berada)
loadEnvConfig(__dirname);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const passwordAdmin = process.env.PASSWORD_ADMIN;

if (!supabaseUrl || !supabaseServiceRoleKey || !passwordAdmin) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY, atau PASSWORD_ADMIN tidak ditemukan di .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const email = 'panggungkreator.idn@gmail.com';
  const password = passwordAdmin;
  const username = 'adminpangkreas';

  console.log("Checking if admin already exists in members table...");

  // Cari di tabel members berdasarkan email
  const { data: existingMember, error: findError } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (findError) {
    console.error("Error searching for existing admin:", findError);
    return;
  }

  if (existingMember) {
    console.log(`Admin found with ID: ${existingMember.id}. Deleting to recreate fresh...`);

    // Hapus user di Supabase Auth (akan meng-cascade delete tabel members juga)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingMember.id);
    if (deleteError) {
      console.error("Failed to delete existing admin:", deleteError);
      return;
    }
    console.log("Existing admin deleted successfully.");
  }

  console.log("Creating a new admin account...");

  // Buat user baru di Supabase Auth menggunakan Admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    console.error("Failed to create admin in Auth:", authError);
    return;
  }

  const userId = authData.user.id;
  console.log("User created in Auth with ID:", userId);

  // Insert profil ke tabel members (termasuk kolom not-null instagram_username dan occupation)
  const { error: dbError } = await supabase
    .from('members')
    .insert({
      id: userId,
      full_name: 'Admin Pangkreas',
      stage_name: 'Admin Pangkreas',
      whatsapp_number: '089999999999',
      email: email,
      username: username,
      instagram_username: 'adminpangkreas',
      occupation: 'Admin',
      payment_status: 'paid',
      role: 'admin',
      membership_tier: 'mvp'     // Default tier untuk admin utama
    });

  if (dbError) {
    console.error("Failed to insert profile in members table:", dbError);
    return;
  }

  console.log("Insert admin role into admin_roles...");
  const { data: newRole, error: roleError } = await supabase
    .from('admin_roles')
    .insert({
      member_id: userId,
      label: 'Super Admin',
      color: 'slate',
      status: 'active'
    })
    .select('id')
    .single();

  if (roleError) {
    console.error("Failed to insert admin role:", roleError);
    return;
  }

  console.log("Seeding initial super admin permissions...");
  const { data: items } = await supabase
    .from('privilege_items')
    .select('id, available_actions');

  if (items) {
    const inserts = [];
    items.forEach(item => {
      if (item.available_actions && Array.isArray(item.available_actions)) {
        item.available_actions.forEach(actionId => {
          inserts.push({
            admin_role_id: newRole.id,
            privilege_item_id: item.id,
            action_id: actionId
          });
        });
      }
    });

    if (inserts.length > 0) {
      const { error: permError } = await supabase
        .from('admin_role_permissions')
        .insert(inserts);
      if (permError) {
        console.error("Failed to seed admin permissions:", permError);
      }
    }
  }

  console.log("Admin account set up successfully!");
}

run();
