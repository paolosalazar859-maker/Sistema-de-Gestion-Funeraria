import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ── Password hashing helper ───────────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Admin: ensure default password exists ────────────────────────────────────
async function ensureDefaultPassword() {
  const existing = await kv.get("admin:password_hash");
  if (!existing) {
    const hash = await hashPassword("admin1234");
    await kv.set("admin:password_hash", { hash });
  }
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/make-server-d9afe8ad/health", (c) => c.json({ status: "ok" }));

// ── ADMIN PROFILE ─────────────────────────────────────────────────────────────

// GET admin profile
app.get("/make-server-d9afe8ad/admin/profile", async (c) => {
  try {
    const profile = await kv.get("admin:profile");
    return c.json(profile || { name: "", email: "", phone: "", position: "Administrador" });
  } catch (err) {
    console.log(`Error al obtener perfil admin: ${err}`);
    return c.json({ error: `Error al obtener perfil: ${err}` }, 500);
  }
});

// POST save admin profile
app.post("/make-server-d9afe8ad/admin/profile", async (c) => {
  try {
    const body = await c.req.json();
    const { name = "", email = "", phone = "", position = "Administrador" } = body;
    await kv.set("admin:profile", { name, email, phone, position });
    return c.json({ ok: true });
  } catch (err) {
    console.log(`Error al guardar perfil admin: ${err}`);
    return c.json({ error: `Error al guardar perfil: ${err}` }, 500);
  }
});

// POST verify admin password
app.post("/make-server-d9afe8ad/admin/verify-password", async (c) => {
  try {
    await ensureDefaultPassword();
    const { password } = await c.req.json();
    if (!password) return c.json({ valid: false });
    const stored = await kv.get("admin:password_hash") as { hash: string } | null;
    const inputHash = await hashPassword(password);
    return c.json({ valid: stored?.hash === inputHash });
  } catch (err) {
    console.log(`Error al verificar contraseña admin: ${err}`);
    return c.json({ error: `Error al verificar contraseña: ${err}` }, 500);
  }
});

// POST change admin password
app.post("/make-server-d9afe8ad/admin/change-password", async (c) => {
  try {
    await ensureDefaultPassword();
    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword) {
      return c.json({ ok: false, error: "Faltan campos requeridos" }, 400);
    }
    const stored = await kv.get("admin:password_hash") as { hash: string } | null;
    const currentHash = await hashPassword(currentPassword);
    if (stored?.hash !== currentHash) {
      return c.json({ ok: false, error: "Contraseña actual incorrecta" });
    }
    const newHash = await hashPassword(newPassword);
    await kv.set("admin:password_hash", { hash: newHash });
    return c.json({ ok: true });
  } catch (err) {
    console.log(`Error al cambiar contraseña admin: ${err}`);
    return c.json({ error: `Error al cambiar contraseña: ${err}` }, 500);
  }
});

// ── GET all services ──────────────────────────────────────────────────────────
app.get("/make-server-d9afe8ad/services", async (c) => {
  try {
    const records = await kv.getByPrefix("service:");
    const services = records
      .filter(Boolean)
      .sort((a: any, b: any) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
    return c.json(services);
  } catch (err) {
    console.log(`Error al cargar servicios: ${err}`);
    return c.json({ error: `Error al cargar servicios: ${err}` }, 500);
  }
});

// ── POST upsert service ───────────────────────────────────────────────────────
app.post("/make-server-d9afe8ad/services", async (c) => {
  try {
    const service = await c.req.json();
    if (!service?.id) {
      return c.json({ error: "El servicio debe tener un campo id" }, 400);
    }
    await kv.set(`service:${service.id}`, service);
    return c.json({ ok: true, id: service.id });
  } catch (err) {
    console.log(`Error al guardar servicio: ${err}`);
    return c.json({ error: `Error al guardar servicio: ${err}` }, 500);
  }
});

// ── DELETE service ────────────────────────────────────────────────────────────
app.delete("/make-server-d9afe8ad/services/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`service:${id}`);
    return c.json({ ok: true, id });
  } catch (err) {
    console.log(`Error al eliminar servicio ${c.req.param("id")}: ${err}`);
    return c.json({ error: `Error al eliminar servicio: ${err}` }, 500);
  }
});

// ── POST migrate: batch-upload many services at once ─────────────────────────
app.post("/make-server-d9afe8ad/services/migrate", async (c) => {
  try {
    const services: any[] = await c.req.json();
    if (!Array.isArray(services)) {
      return c.json({ error: "Se esperaba un array de servicios" }, 400);
    }
    const keys: string[] = [];
    const values: any[] = [];
    for (const s of services) {
      if (s?.id) {
        keys.push(`service:${s.id}`);
        values.push(s);
      }
    }
    if (keys.length > 0) {
      await kv.mset(keys, values);
    }
    return c.json({ ok: true, migrated: keys.length });
  } catch (err) {
    console.log(`Error en migración masiva: ${err}`);
    return c.json({ error: `Error en migración: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);