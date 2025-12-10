File ReadME per il DB:

Questo DB è composto da 5 tabelle principali, atte a gestire il corretto funzionamento del programma:
1) users: Contiene tutte le informazioni relative a mentor, mentee e admins.
Contiene tutte le informazioni relative a mentor, mentee e utenti amministrativi.

id – identificatore univoco.
name, surname – dati anagrafici.
email – univoca per ogni utente.
password_hash – hash della password.
role – tipo utente (mentor, mentee, admin).
bio, photo_url – informazioni di profilo.
created_at – timestamp di creazione dell’account.

2) mentor_sectors: Associa ogni mentor ai settori professionali di cui si occupa.

mentor_id – riferimento alla tabella users.
sector_name – nome del settore (es. "Software Development").
**La chiave primaria è composta da (mentor_id, sector_name).

3) mentor_availability: Definisce le disponibilità settimanali dei mentor.

mentor_id – riferimento alla tabella users.
weekday – giorno della settimana (1–7).
start_time, end_time – intervallo orario.

4) sessions: Rappresenta le sessioni di mentoring prenotate tra un mentor e un mentee.

mentor_id – riferimento al mentor.
mentee_id – riferimento al mentee.
start_datetime, end_datetime – orario della sessione.
status – stato della sessione (pending, confirmed, completed, cancelled).
meeting_link – link alla videochiamata.

5) reviews: Contiene le recensioni dei mentee verso i mentor

mentor_id, mentee_id – riferimenti alla tabella users.
rating – voto (1–5).
comment – testo della recensione.
created_at – timestamp.

# Come importare il database tramite pgAdmin:

1.Aprire pgAdmin 4.
2.Nel menu a sinistra, espandere Servers e selezionare il tuo server locale.
3.Clic destro su Databases → Create → Database…
4.Inserire il nome: mentormatch
5.Cliccare save.

6.Selezionare il database mentormatch.
7.In alto, cliccare su Query Tool.
8.Si aprirà un editor SQL.

9.Aprire il file e copiare i contenuti di schema_mentormatch.sql
10.Incollare il testo nel Query Tool di pgAdmin.
11.Premere il pulsante Execute.

Se tutto ha funzionato correttamente in mentormatch -> Schemas -> public -> Tables si dovrebbero vedere le 5 tabelle create.