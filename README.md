# Website Checker App

A basic Node.js app that checks static websites and sends SMS plus WhatsApp alerts through your own APIs when a website goes down.

## Requirements

- Node.js 18 or newer

## Setup

Update `src/config.js`:

- Add your websites in `websites`
- Add your phone numbers in `recipients`
- Replace the SMS and WhatsApp `endpoint`, `headers`, and API keys with your own API details

The app sends alert payloads like this:

```json
{
  "to": "+911234567890",
  "message": "Website down alert\nName: Example Website\nURL: https://example.com\n..."
}
```

If your APIs need a different request body, change `sendSmsAlert` and `sendWhatsappAlert` in `src/notifier.js`.

## Run

```bash
npm start
```

## Verify syntax

```bash
npm run check
```

## Behavior

- Checks every 60 seconds
- Treats non-2xx HTTP responses, timeouts, and network errors as down
- Sends SMS and WhatsApp alerts once per down event
- Does not send the same alert repeatedly while the website remains down
- Allows another alert after the website recovers and goes down again
