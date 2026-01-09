# Backend

## Requisiti

- Node.js
- Permessi per installare pacchetti npm

Pacchetti principali usati nel progetto:

npm install express 
npm install pg 
npm install dotenv
npm install jsonwebtoken
npm install bcrypt
npm install googleapis
npm install cors

## Installazione (rapida)

1. Clona il repository e spostati nella cartella del progetto.
2. Installa le dipendenze con il comando mostrato sopra.
3. Crea un file `.env` nella root e aggiungi le variabili di configurazione (es. stringa di connessione al DB).

## Architettura del backend

L'architettura proposta è basata su tre layer principali:

- **Controllers**: gestiscono le richieste HTTP e definiscono gli endpoint; ricevono i dati dal client, validano/parsing dove necessario e invocano i servizi.
- **Services**: contengono la logica applicativa; orchestrano operazioni complesse, validazioni di business e chiamate ai repository.
- **Repositories**: si occupano dell'accesso al database (query, mapping dei risultati); forniscono un'astrazione del DB verso i servizi.

Questa separazione aiuta a isolare la logica, rendere i componenti più testabili e permettere cambi al livello di persistenza senza impattare i controller.

## Moduli aggiuntivi

- **Middleware / Auth**: middleware per autenticazione e verifica JWT token.
- **Middleware / DTO**: middleware per la verifica e validazione degli input delle richieste.
- **Error handling**: handler centrale per le eccezioni e gli errori, che normalizza le risposte d'errore verso il client.
- **Config**: modulo per centralizzare la lettura delle variabili d'ambiente e la configurazione (porta, DB, elementi privati).

## Struttura delle cartelle

src/
	controllers/
	services/
	repositories/
	dtos/
	middleware/
	config/
	app.js
	bootstrap.js
	routes.js