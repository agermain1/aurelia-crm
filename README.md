- Introducción

Analizando el pdf cedido por Aurelia, decidí, inicialmente crear un CRM en el que se puedan recibir mensajes a través de un formulario básico y responder desde el panel del CRM. También la idea inicial era simplemente mostrar un dashboard con cantidad de mensajes, chats, etc(KPIs/metricas básicas). Dicho esto, al empezar a desarrollarlo, quise ir un poco más allá y poder integrar whatsapp, dado que la API es paga, fui por una integración con Twilio(para obtener un trial).

- Descripción del proyecto

Teniendo la idea en mente, para esta prueba, decidií finalmente que el CRM se enfoque y simule la gestión de reservas para un restaurante mediante Whatsapp.

Alcance del desarrollo:
* Recibir mensajes desde WhatsApp mediante Twilio Sandbox.
* Crear leads y conversaciones automaticamente.
* Historial de mensajes con persistencia.
* Respuesta automática del CRM mediante un modelo de IA basado en reglas (casero, ya que Open AI es pago y para usar otros de manera gratuita necesito instalarlos en mi PC, estos últimos no tienen alcance en un despliegue y lleva mas configuración para correr el proyecto local).
* Permitir intervención de una persona(humano) para tomar el control de una conversación.
* Visualizar métricas generales y estados de leads/reservas.

La arquitectura se pensó para que sea un mvp sumamente escalable.

- Qué se construyó en concreto

# Integración con whatsapp via twilio(webhook inbound y envio outbound)
# Persistencia en base de datos (Supabase)
# Módulo inbox con historial en tiempo real
# Gestión AI/Humano para evitar cruces en una conversación
# Motor de IA gratuito basado en reglas (filling + contexto, archivo .js con reglas para las respuestas)
# Dashboard de metricas generales
# Pantalla leads con estados(conversación, confirmado, cancelado)
# Manejo de contexto (JSON en base de datos)

No elegí ir por el lado de Auth, roles/permisos, tabla dedicada para reservas, UI avanzada, porque la prioridad fue cubrir flujos core para un MVP con criterio técnico.

- Por qué de las decisiones

# Integración con whatsapp, demuestra capacidad del mvp
# Persistencia estructurada para que el CRM sea totalmente funcional
# Separación del backend, frontend y servicios para tener un proyecto modular
# IA(casera) basada en reglas en un lugar de una IA de terceros, para poder mantener costo cero de desarrollo inicialmente y demostrar comprensión del flujo conversacional.

En pocas palabras prioricé claridad y entendimiento de un MVP funcional y de valor con criterio de producto.

- Arquitectura

Fullstack basada en Next.js

* Frontend: Nextjs, tailwindcss, zustand(estado global del inbox), Polling controlado para actualización de conversaciones
* Backend: API Routes dentro de Nextjs(serverless)
* Servicios separados para leads, conversaciones, mensajes
* Webhook de twilio para recepción de mensajes
* Motor IA basado en reglas (aiFree.js)

- Base de datos

* Supabase
* Contexto conversacional guardado en JSON

- Infraestructura

* Entorno local para desarrollo
* Vercel para despliegue
* Twilio Sandbox para Whatsapp

- Modelo de datos

Tablas
* leads: id, phone, name, status, created_at
* conversations: id, lead_id, channel, status, owner, context, last_message_at, laste_message_preview, unread_count, created_at, updated_at
* messages: id, conversation_id, direction, role, content, external_id(para idempotencia twilio), created_at

- Tradeofss

- IA basada en reglas en lugar de terceros
Permite costo cero, control total del comportamiento y menor complejidad. Como desventaja, tiene menor flexibilidad semántica que un modelo grande.

- Polling en lugar de realtime
Simplifica la implementación y reduce dependencias. A mayor escala podría reemplazarse por un sistema en tiempo real.

- Backend serverless integrado en Next.js
Reduce complejidad de infraestructura y acelera desarrollo. Si el volumen creciera, podría separarse en un servicio independiente.


- Qué haría con dos semanas más

* Crear una tabla formal de reservas separada del contexto conversacional

* Implementar realtime en lugar de polling

* Agregar autenticación y roles

* Integrar IA real

* Mejorar métricas (conversión, tiempos de respuesta, cancelaciones)

* Mejorar interfaz de usuario UX/UI

- Como escalaría
Escalaría separando el backend del frontend, procesando mensajes en forma asíncrona con cola/worker(actualemnte se guardan datos, se genera respuesta y se manda wpp en un request), usando realtime en lugar de polling, normalizando reservas en una tabla y preparando multi-tenant con seguridad y observabilidad


INSTRUCCIONES
- Correr local
* * 
Requisitos: Node + npm

Instalar deps: npm install

Variables .env.local:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

TWILIO_ACCOUNT_SID

TWILIO_AUTH_TOKEN

TWILIO_WHATSAPP_NUMBER

Ejecutar: npm run dev

* * 

- 

Requisitos para que funcione el sistema de mensajería
* * 
Exponer localhost con ngrok

Configurar webhook en Twilio Sandbox apuntando a:

https://xxxx.ngrok-free.app/api/webhooks/whatsapp
 (POST)
* * 

- 

Deploy en Vercel
* * 
Cargar las mismas env variables en Vercel

Ajustar webhook Twilio a la URL de Vercel:

https://tu-app.vercel.app/api/webhooks/whatsapp
* * 

- 

Demo final

* Inbox: recibir mensaje en tiempo real

* Owner: pasar a human y verificar que no responda IA

* IA: reservar + confirmar + cancelar