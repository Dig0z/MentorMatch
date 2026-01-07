# Architettura Frontend — MentorMatch  
**Tipo di architettura:** MPA (Multi-Page Application)  
**Tecnologie utilizzate:** HTML5, CSS3, Bootstrap 5, JavaScript modulare (ESM)

## 1. Obiettivo dell’architettura
L’architettura frontend di MentorMatch è progettata come una Multi-Page Application (MPA).  
Ogni vista principale dell'applicazione corrisponde a una pagina HTML distinta, e la navigazione avviene tramite transizioni complete tra una pagina e l'altra.  
Questo approccio è adatto al progetto, poiché non si utilizzano framework front-end come React, Vue o Angular, e consente una strutturazione chiara, semplice e facilmente manutenibile.

## 2. Struttura logica del frontend
Il frontend è suddiviso in più pagine HTML, ognuna responsabile della propria interfaccia e del caricamento degli script JavaScript necessari per interagire con il backend.

La divisione dei file segue un criterio funzionale:

### • Cartella **pages/**
Contiene tutte le pagine HTML principali dell’applicazione, tra cui:
- `index.html`: pagina iniziale  
- `login.html`: autenticazione  
- `register.html`: registrazione  
- `mentors.html`: catalogo dei mentori  
- `mentor-profile.html`: profilo dettagliato di un singolo mentor  

Ogni pagina include Bootstrap tramite CDN e importa solo gli script necessari alla sua logica.

### • Cartella **css/**
Include:
- `bootstrap.min.css`: foglio di stile principale del framework  
- `styles.css`: personalizzazioni specifiche dell'applicazione  

Le modifiche CSS vengono mantenute minime per preservare la coerenza con Bootstrap.

### • Cartella **js/**
Contiene i moduli JavaScript che implementano la logica dell’applicazione.  
Ogni file è dedicato a un’area funzionale:

- `api.js`: funzioni standardizzate per effettuare richieste HTTP  
- `auth.js`: gestione di login, registrazione e sessione utente  
- `mentors.js`: caricamento e visualizzazione dell’elenco dei mentori  
- `profile.js`: caricamento dei dati specifici di un mentor selezionato  
- `utils.js`: funzioni di supporto riutilizzabili  

Questo approccio modulare migliora la leggibilità e la manutenzione del codice.

### • Cartella **components/**
Contiene elementi HTML riutilizzabili, come navbar o footer, per mantenere coerenza visiva tra le pagine.

### • Cartella **img/**
Contiene loghi, immagini decorative e avatar.

## 3. Funzionamento generale
1. L’utente apre una pagina HTML tramite il browser.  
2. La pagina include il relativo file JavaScript che gestisce la logica associata.  
3. I moduli JavaScript, quando necessario, recuperano dati dal backend tramite Fetch API.  
4. I dati dinamici vengono inseriti nel DOM e visualizzati tramite layout Bootstrap.  
5. La navigazione tra le pagine avviene tramite collegamenti statici presenti nella barra di navigazione.
