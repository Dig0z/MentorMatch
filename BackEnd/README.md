## Email Notifications

The backend sends SendGrid emails for booking and cancellation events:
- Booking: mentor and mentee receive details (names, date, time, modality) including a fixed Meet link.
- Cancellation: the cancelling user receives a confirmation; the other party is notified of the cancellation.

Configure SendGrid in `.env`:

```
SENDGRID_API_KEY=your_key
SENDGRID_FROM=verified@yourdomain.com
SENDGRID_DATA_RESIDENCY=global # or 'eu' if you use an EU subuser key
FAKE_MEET_LINK=https://meet.google.com/lookup/mentormatch-demo
```

If you set `SENDGRID_DATA_RESIDENCY=eu`, ensure the API key is an EU regional subuser key and the `SENDGRID_FROM` is verified for that subuser.
# MentorMatch
Progetto universitario per il corso di sviluppo web: realizzazione della piattaforma “MentorMatch”.
