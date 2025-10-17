# Salon CRM (Demo v0.9.1)

Zwei Routen:
- `/client` – Kundenseite (Buchungsanfrage)
- `/entrepreneur` – Unternehmer (Dashboard) + `/entrepreneur/settings`

## Start (DEV)
```bash
npm install
npm run dev
# http://localhost:3000
```

In DEV sind E-Mail und SMS **simuliert**. Öffnungszeiten/Feiertage in **Einstellungen** pflegen.

## Produktion / Provider
- Mails via Resend: setze `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`.
- SMS via Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`.
- (In dieser Demo noch nicht verdrahtet – API-Stubs sind vorgesehen.)

## Hinweise
- Timezone: Europe/Zurich
- Slots: 15 min (änderbar in Einstellungen)
- Konfliktlogik: pending & fixe Termine blocken Slots.
- Daten sind **in-memory** (reset bei Neustart). Für PROD bitte echte DB anschließen.
