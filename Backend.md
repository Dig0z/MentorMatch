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
- **DTOs**: applicano i controlli sintattici e formali agli input del client. Un apposito middleware si occuperà di verificare che i check siano rispettati, mentre eventuali controlli logici vengono fatti dai services.

Questa separazione aiuta a isolare la logica, rendere i componenti più testabili e permettere cambi al livello di persistenza senza impattare i controller.

## Moduli aggiuntivi

- **Middleware / Auth**: middleware per autenticazione e verifica JWT token.
- **Middleware / DTO**: middleware per la verifica e validazione degli input delle richieste.
- **Error handling**: handler centrale per le eccezioni e gli errori, che normalizza le risposte d'errore verso il client.
- **Config**: folder per centralizzare la lettura delle variabili d'ambiente e la configurazione (porta, DB, elementi privati).
- **bootstrap.js**: modulo contenente la funzione principale eseguita all'avvio del programma (app.listen), separata per caricare in maniera asincrona il token di Google.
- **routes.js**: modulo che associa ad ogni path un modulo Controller con le relative funzioni ed endpoints.
- **app.js**: modulo di avvio del server. Contiene la definizione ed il caricamento delle principali librerie utilizzate dal programma.

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