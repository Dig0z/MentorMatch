# Piano di Lavoro MentorMatch (12/01)  
### Ruoli:
- Frontend + PM (tu)
- Backend Developer
- Database Specialist
- DevOps Engineer

---

## 🗓️ Settimana 1 — Definizione & Architettura

| Ruolo | Compiti |
|-------|---------|
| **Frontend + PM** | Scegliere framework, creare struttura base del progetto, definire routing e pagine principali, creare wireframe. Organizzare roadmap e documentazione iniziale. |
| **Backend** | Definire architettura API, impostare controllers/services, creare progetto backend. |
| **Database** | Disegnare il diagramma ER, definire entità e relazioni. |
| **DevOps** | Creare repository, configurare Dockerfile e docker-compose base. |

---

## 🗓️ Settimana 2 — Autenticazione & Utenti

| Ruolo | Compiti |
|-------|---------|
| **Frontend + PM** | Implementare pagine Login/Register, gestione JWT, validare UX del flusso di autenticazione. |
| **Backend** | Implementare `/auth/register` e `/auth/login`, gestione ruoli mentor/mentee, sicurezza JWT. |
| **Database** | Creare tabelle User e MentorProfile, migrazioni iniziali. |
| **DevOps** | Configurare variabili di ambiente, preparare DB remoto (se necessario). |

---

## 🗓️ Settimana 3 — Mentori, Catalogo & Profilo

| Ruolo | Compiti |
|-------|---------|
| **Frontend + PM** | Creare pagina lista mentori con filtri, creare pagina profilo mentor, testing UX. |
| **Backend** | Endpoints `/mentors` e `/mentors/:id`, logica di filtraggio. |
| **Database** | Tabelle per competenze, lingue, strutture preliminari per recensioni. |
| **DevOps** | Pipeline CI/CD base per backend, deploy provvisorio. |

---

## 🗓️ Settimana 4 — Calendario & Prenotazioni (Core)

| Ruolo | Compiti |
|-------|---------|
| **Frontend + PM** | Creare vista calendario mentor, implementare finestra di prenotazione, dashboard utente. |
| **Backend** | Endpoints CRUD per slot (POST/GET/DELETE) e prenotazioni (POST/GET/DELETE). Prevenzione doppie prenotazioni. |
| **Database** | Tabelle AvailabilitySlot e Booking, constraints per evitare conflitti. |
| **DevOps** | Deploy frontend dev, collegamento stabile con backend cloud. |

---

## 🗓️ Settimana 5 — Recensioni, Notifiche & Rifiniture

| Ruolo | Compiti |
|-------|---------|
| **Frontend + PM** | Aggiungere recensioni al profilo mentor, migliorare UI/UX, aggiornare dashboard, preparare demo interna. |
| **Backend** | Implementare `/reviews`, email di notifica, gestione cancellazioni. |
| **Database** | Creare tabella Review e ottimizzare indici. |
| **DevOps** | Pipeline completa frontend+backend, configurare HTTPS e variabili finali. |

---

## 🗓️ Settimana 6 — Testing, Documentazione & Presentazione Finale

| Ruolo | Compiti |
|-------|---------|
| **Frontend + PM** | Testing completo, ottimizzazioni finali, creare README definitivo, preparare presentazione e demo. |
| **Backend** | Test unitari e funzionali, controlli sicurezza, pulizia generale del codice. |
| **Database** | Controllo schema finale, backup, migrazioni stabili. |
| **DevOps** | Deploy finale stabile, monitoraggio e verifiche end-to-end. |

---

# 🎯 Obiettivo Finale (12/01)
- Piattaforma funzionante online  
- Registrazione/Login + ruoli  
- Catalogo mentori + profili  
- Calendario e prenotazioni operative  
- Dashboard + recensioni  
- Notifiche email  
- Documentazione + demo finale  

