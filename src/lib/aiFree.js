function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextDow(baseDate, targetDow) {
  const d = new Date(baseDate);
  const delta = (targetDow - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + delta);
  return d;
}

function extractPeople(text) {
  const m =
    text.match(/(\d+)\s*(personas|persona|pax)/i) ||
    text.match(/para\s*(\d+)/i) ||
    text.match(/somos\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function extractName(text) {
  // Soporta nombre + apellido(s) (hasta 3 palabras)
  const m =
    text.match(
      /a nombre de\s+([a-zA-Z\u00C0-\u017F]+(?:\s+[a-zA-Z\u00C0-\u017F]+){0,2})/i
    ) ||
    text.match(
      /soy\s+([a-zA-Z\u00C0-\u017F]+(?:\s+[a-zA-Z\u00C0-\u017F]+){0,2})/i
    ) ||
    text.match(
      /me llamo\s+([a-zA-Z\u00C0-\u017F]+(?:\s+[a-zA-Z\u00C0-\u017F]+){0,2})/i
    );

  return m ? m[1].trim() : null;
}

function extractHour(text) {
  const t = norm(text);

  // 21:30
  let m = t.match(/(\d{1,2}):(\d{2})/);
  if (m) {
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h <= 23 && min <= 59) return `${pad2(h)}:${pad2(min)}`;
  }

  // 21hs / 21 hs
  m = t.match(/\b(\d{1,2})\s*hs\b/);
  if (m) {
    const h = Number(m[1]);
    if (h <= 23) return `${pad2(h)}:00`;
  }

  // a las 9 / a las 21
  m = t.match(/a\s*las\s*(\d{1,2})\b/);
  if (m) {
    const h = Number(m[1]);
    if (h <= 23) return `${pad2(h)}:00`;
  }
 m = t.match(/\b(\d{1,2})\s*horas?\b/);
  if (m) {
    const h = Number(m[1]);
    if (h <= 23) return `${pad2(h)}:00`;
  }
  // 9 y media
  m = t.match(/\b(\d{1,2})\s*y\s*media\b/);
  if (m) {
    const h = Number(m[1]);
    if (h <= 23) return `${pad2(h)}:30`;
  }

  // tipo 20 / tipo 20:30
  m = t.match(/tipo\s*(\d{1,2})(?::(\d{2}))?/);
  if (m) {
    const h = Number(m[1]);
    const min = m[2] ? Number(m[2]) : 0;
    if (h <= 23 && min <= 59) return `${pad2(h)}:${pad2(min)}`;
  }

  return null;
}

function extractAbsoluteDate(text, now = new Date()) {
  const t = norm(text);

  // 12/02 o 12-02 (año actual)
  const m = t.match(/(\d{1,2})[\/\-](\d{1,2})/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) {
      const date = new Date(now.getFullYear(), mo - 1, d);
      return toISODate(date);
    }
  }

  return null;
}

function extractRelativeDate(text, now = new Date()) {
  const t = norm(text);

  // OJO: chequeamos "pasado manana" antes de "manana"
  if (/\bpasado manana\b/.test(t)) return toISODate(addDays(now, 2));
  if (/\bhoy\b/.test(t)) return toISODate(now);
  if (/\bmanana\b/.test(t)) return toISODate(addDays(now, 1));

  const dows = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
  };

  for (const [name, dow] of Object.entries(dows)) {
    const re = new RegExp(`\\b(este\\s+)?${name}\\b`, "i");
    if (re.test(t)) return toISODate(nextDow(now, dow));
  }

  // finde -> sábado
  if (/\bfin de semana\b/.test(t) || /\bel finde\b/.test(t)) {
    return toISODate(nextDow(now, 6));
  }

  return null;
}

function detectIntent(text) {
  const t = norm(text);
  if (!t) return "unknown";

  // ✅ confirmación / negación
  if (
    /(^|\b)(si|sí|confirmo|confirmar|dale|ok|oka|de una|listo|perfecto|confirmado)\b/.test(
      t
    )
  )
    return "confirm";

  if (/(^|\b)(no|mejor no|dejalo|deja|olvidalo)\b/.test(t)) return "deny";

  if (/(hola|buenas|buen dia|buenas tardes|buenas noches)/.test(t)) return "greeting";

  // ✅ cancelación “humana”
  if (
    /(cancel|cancelar|cancelame|cancela|anular|anulame|baja la reserva|dar de baja|se puede cancelar|puedo cancelar)/.test(
      t
    )
  )
    return "cancel";

  if (/(cambiar|reprogramar|mover)/.test(t)) return "reschedule";
  if (/(reserva|reservar|mesa|disponibilidad|hay lugar|tienen lugar|quiero ir)/.test(t))
    return "reserve";

  return "unknown";
}

function prettyDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return `${days[date.getDay()]} ${pad2(d)}/${pad2(m)}`;
}

/**
 * IA gratis pero "humana": entiende relativos + mantiene contexto.
 * Devuelve { reply, nextContext, done }
 */
export function generateFreeAIReply({ inboundText, context = {}, now = new Date() }) {
  const intent = detectIntent(inboundText);

  const date =
    extractAbsoluteDate(inboundText, now) ||
    extractRelativeDate(inboundText, now) ||
    context.date ||
    null;

  const time = extractHour(inboundText) || context.time || null;
  const people = extractPeople(inboundText) ?? context.people ?? null;

  // nombre: si el usuario manda "Andres Germain" solo, también lo aceptamos si estamos esperando nombre
  const extractedName = extractName(inboundText);
  const plainName =
    !extractedName && context.pending_name
      ? inboundText.trim().split(/\s+/).slice(0, 3).join(" ")
      : null;

  const name = extractedName || plainName || context.name || null;

  const nextContext = { ...context, date, time, people, name };

  // ✅ Si veníamos pidiendo confirmación y el usuario confirma
  if (intent === "confirm" && context?.pending_confirmation) {
    const summary = `${prettyDate(nextContext.date)} a las ${nextContext.time} para ${nextContext.people} (${nextContext.name})`;
    return {
      reply: `Confirmado ✅ Quedó la reserva para ${summary}. ¡Te esperamos!`,
      nextContext: {
        ...nextContext,
        status: "confirmed",
        pending_confirmation: false,
        pending_name: false,
      },
      done: true,
    };
  }

  // ✅ Si veníamos pidiendo confirmación y el usuario niega
  if (intent === "deny" && context?.pending_confirmation) {
    return {
      reply: "Listo, no la confirmo. Si querés, decime otro día/horario y lo armamos.",
      nextContext: { ...nextContext, pending_confirmation: false, pending_name: false },
      done: false,
    };
  }

  if (intent === "greeting") {
    return {
      reply: "¡Hola! 😊 ¿Para qué día y horario querés reservar y cuántas personas son?",
      nextContext: { ...nextContext, pending_name: false },
      done: false,
    };
  }

  if (intent === "cancel") {
    // ✅ si ya había una reserva confirmada en contexto, la cancelamos directo
    if (context?.status === "confirmed" && context?.date && context?.time && context?.name) {
      return {
        reply: `Listo ✅ Cancelé la reserva de ${context.name} para ${prettyDate(context.date)} a las ${context.time}.`,
        nextContext: {
          ...context,
          status: "cancelled",
          pending_confirmation: false,
          pending_name: false,
        },
        done: true,
      };
    }

    return {
      reply: "Dale. Para cancelar: ¿para qué día y horario era la reserva, y a nombre de quién?",
      nextContext: {
        ...context,
        status: "cancelling",
        pending_confirmation: false,
        pending_name: false,
      },
      done: false,
    };
  }

  if (intent === "reschedule") {
    return {
      reply:
        "Perfecto. Decime cuál es la reserva actual (día/horario) y a qué nuevo día/horario querés moverla.",
      nextContext: { ...context },
      done: false,
    };
  }

  // Reserve / Unknown → guía por slots
  const missing = [];
  if (!nextContext.date) missing.push("día");
  if (!nextContext.time) missing.push("horario");
  if (!nextContext.people) missing.push("cantidad de personas");

  if (missing.length) {
    const got = [];
    if (nextContext.date) got.push(`día: ${prettyDate(nextContext.date)}`);
    if (nextContext.time) got.push(`hora: ${nextContext.time}`);
    if (nextContext.people) got.push(`personas: ${nextContext.people}`);

    const prefix = got.length ? `Genial, tengo ${got.join(" · ")}. ` : "Dale. ";
    const ask =
      missing.length === 1
        ? `¿Me decís el ${missing[0]}?`
        : `Me falta: ${missing.join(", ")}. ¿Me lo pasás?`;

    return {
      reply: prefix + ask,
      nextContext: { ...nextContext, pending_name: false },
      done: false,
    };
  }

  // Si ya tiene todo, pedir nombre si falta
  if (!nextContext.name) {
    return {
      reply: `Perfecto ✅ ${prettyDate(nextContext.date)} a las ${nextContext.time} para ${nextContext.people}. ¿A nombre de quién lo dejamos?`,
      nextContext: { ...nextContext, pending_name: true, pending_confirmation: false },
      done: false,
    };
  }

  // Si ya tiene nombre también, pedir confirmación (y marcar flag)
  return {
    reply: `Listo 🙌 Te reservo para ${nextContext.name}: ${prettyDate(nextContext.date)} a las ${nextContext.time}, ${nextContext.people} persona(s). ¿Confirmo?`,
    nextContext: { ...nextContext, pending_confirmation: true, pending_name: false },
    done: false,
  };
}
