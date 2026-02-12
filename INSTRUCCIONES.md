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