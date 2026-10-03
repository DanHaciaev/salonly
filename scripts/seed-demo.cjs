require("dotenv").config({ path: ".env.local" });
const { randomUUID } = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SLUG = "demo";
const OWNER_EMAIL = "demo-owner@salonly.app";

async function main() {
  const { data: existing } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", SLUG)
    .maybeSingle();
  if (existing) {
    console.log("Demo business already exists, skipping.");
    return;
  }

  const { data: userList } = await admin.auth.admin.listUsers();
  let owner = userList.users.find((u) => u.email === OWNER_EMAIL);
  if (!owner) {
    const { data, error } = await admin.auth.admin.createUser({
      email: OWNER_EMAIL,
      password: randomUUID(),
      email_confirm: true,
    });
    if (error) throw error;
    owner = data.user;
  }

  const { data: business, error: bizError } = await admin
    .from("businesses")
    .insert({
      owner_id: owner.id,
      slug: SLUG,
      name: "Атлас — студия красоты",
      description:
        "Премиальная студия стрижек, окрашивания и ухода. Это демо-страница — так будет выглядеть сайт вашего бизнеса на Salonly.",
      phone: "+373 22 000 000",
      address: "Кишинёв, ул. Примерная, 12",
    })
    .select("id")
    .single();
  if (bizError) throw bizError;

  await admin.from("notification_settings").insert({ business_id: business.id });

  const services = [
    { name: "Женская стрижка", description: "Стрижка, укладка и консультация по уходу", price: 450, duration_minutes: 60 },
    { name: "Окрашивание", description: "Окрашивание в один тон или сложная техника", price: 1200, duration_minutes: 150 },
    { name: "Мужская стрижка", description: "Классическая или модельная стрижка", price: 300, duration_minutes: 40 },
    { name: "Маникюр", description: "Классический маникюр с покрытием гель-лак", price: 350, duration_minutes: 60 },
    { name: "Укладка", description: "Вечерняя или повседневная укладка", price: 400, duration_minutes: 45 },
  ];
  const { data: insertedServices, error: servicesError } = await admin
    .from("services")
    .insert(services.map((s, i) => ({ ...s, business_id: business.id, sort_order: i })))
    .select("id, name");
  if (servicesError) throw servicesError;

  const byName = Object.fromEntries(insertedServices.map((s) => [s.name, s.id]));

  const staff = [
    {
      name: "Анна Морару",
      title: "Старший стилист",
      bio: "10 лет в индустрии, специализация — сложное окрашивание и уход за волосами.",
      services: ["Женская стрижка", "Окрашивание", "Укладка"],
    },
    {
      name: "Виктор Русу",
      title: "Барбер",
      bio: "Мужские стрижки и оформление бороды — четыре года практики в барбершопах Кишинёва.",
      services: ["Мужская стрижка", "Укладка"],
    },
    {
      name: "Ирина Кожокару",
      title: "Мастер маникюра",
      bio: "Аккуратный маникюр и аккуратность в деталях — более 500 довольных клиентов.",
      services: ["Маникюр"],
    },
  ];

  for (const [i, member] of staff.entries()) {
    const { data: staffRow, error: staffError } = await admin
      .from("staff")
      .insert({
        business_id: business.id,
        name: member.name,
        title: member.title,
        bio: member.bio,
        sort_order: i,
      })
      .select("id")
      .single();
    if (staffError) throw staffError;

    await admin.from("staff_services").insert(
      member.services.map((name) => ({ staff_id: staffRow.id, service_id: byName[name] }))
    );

    // Mon–Fri 9:00–19:00 (day_of_week: 0 = Sunday ... 6 = Saturday)
    await admin.from("staff_hours").insert(
      [1, 2, 3, 4, 5].map((day) => ({
        staff_id: staffRow.id,
        day_of_week: day,
        start_time: "09:00",
        end_time: "19:00",
      }))
    );

    const reviews = {
      "Анна Морару": [
        { client_name: "Мария", rating: 5, comment: "Лучшее окрашивание из всех, что делала! Очень довольна." },
        { client_name: "Светлана", rating: 5, comment: "Аня — профессионал, всегда советует то, что действительно подходит." },
      ],
      "Виктор Русу": [
        { client_name: "Дмитрий", rating: 5, comment: "Хожу только к Виктору уже год, всегда аккуратно и по делу." },
      ],
      "Ирина Кожокару": [
        { client_name: "Елена", rating: 5, comment: "Маникюр держится по три недели, руки золотые." },
      ],
    };

    await admin.from("reviews").insert(
      (reviews[member.name] ?? []).map((r) => ({
        business_id: business.id,
        staff_id: staffRow.id,
        client_name: r.client_name,
        rating: r.rating,
        comment: r.comment,
        is_published: true,
      }))
    );
  }

  console.log("Demo business seeded: /" + SLUG);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
