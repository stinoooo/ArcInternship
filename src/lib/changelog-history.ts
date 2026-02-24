// Canonical changelog history — imported by both the seed route and the auto-seed in GET /api/changelog
export const CHANGELOG_HISTORY = [
  {
    version: '0.1.0',
    date: '2026-02-23',
    nl: [
      'Eerste versie van ArcInternship gelanceerd',
      'Dagelijkse uren registreren met type-selectie (werkdag, thuiswerk, vrij, ziek, feestdag)',
      'Volledig weekoverzicht op het dashboard',
      'Excel-export van je stagelogboek',
      'Zelfregistratie met beheerdergoedkeuring',
      'EN/NL taalkeuze op de inlog- en registratiepagina',
      'Donkere en lichte modus',
      'Mobiele navigatie voor gebruik op telefoon',
    ],
    en: [
      'Initial launch of ArcInternship',
      'Daily hour tracking with day type selection (workday, remote, day off, sick, holiday)',
      'Full week overview on the dashboard',
      'Excel export of your internship log',
      'Self-registration with admin approval',
      'EN/NL language toggle on login and register screens',
      'Dark and light theme support',
      'Mobile navigation for phone use',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-02-24',
    nl: [
      'Vereenvoudigd rolmodel: beheerder en gast',
      'Gast-accounts kunnen uren bekijken maar niet bewerken',
      'Beheerder heeft volledige schrijftoegang',
    ],
    en: [
      'Simplified role model: admin and guest',
      'Guest accounts can view hours but not edit',
      'Admin has full write access',
    ],
  },
  {
    version: '0.3.0',
    date: '2026-02-24',
    nl: [
      'Voettekst toegevoegd met links naar juridische pagina\'s',
      'App-subtitels hersteld in de navigatie',
      'Algemene visuele verbeteringen',
    ],
    en: [
      'Footer added with links to legal pages',
      'App subtitles restored in navigation',
      'General visual improvements',
    ],
  },
  {
    version: '0.4.0',
    date: '2026-02-24',
    nl: [
      'Automatische versiecontrole elke 2 minuten',
      'Updatemelding verschijnt wanneer een nieuwe versie beschikbaar is',
      'Pagina wordt automatisch ververst na 15 seconden bij een update',
    ],
    en: [
      'Automatic version check every 2 minutes',
      'Update notification appears when a new version is available',
      'Page automatically refreshes after 15 seconds on update',
    ],
  },
  {
    version: '0.5.0',
    date: '2026-02-24',
    nl: [
      'ArcStage hernoemd naar ArcInternship in de hele applicatie',
      'Nieuw logo en branding consistent doorgevoerd',
    ],
    en: [
      'ArcStage renamed to ArcInternship throughout the application',
      'New logo and branding consistently applied',
    ],
  },
  {
    version: '0.6.0',
    date: '2026-02-24',
    nl: [
      'Weeklabels in het dagoverzicht gecorrigeerd',
      'Pagina "Gebruiksvoorwaarden" (/use) toegevoegd',
      'Tabbladtitel consistent gemaakt: toont altijd de juiste paginanaam',
    ],
    en: [
      'Week labels in the day overview corrected',
      'Terms of Use page (/use) added',
      'Browser tab title made consistent: always shows the correct page name',
    ],
  },
  {
    version: '0.6.1',
    date: '2026-02-24',
    nl: [
      'Crash bij inloggen opgelost (HTTP 405 fout)',
      'Verouderde gebruik-pagina verwijderd',
    ],
    en: [
      'Login crash fixed (HTTP 405 error)',
      'Obsolete usage page removed',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-02-24',
    nl: [
      'Versienummer zichtbaar in de voettekst',
      'Update-banner toont nu van welke naar welke versie je upgradet (bijv. v1.1.0 → v1.2.0)',
    ],
    en: [
      'Version number visible in the footer',
      'Update banner now shows which version you are upgrading from and to (e.g. v1.1.0 → v1.2.0)',
    ],
  },
  {
    version: '3.4.2',
    date: '2026-02-24',
    nl: [
      'Volledige multi-gebruiker ondersteuning: elke student heeft zijn eigen data',
      'Docent-dashboard met studentenschakelaar om per student de uren te bekijken',
      'Onboarding-flow voor nieuwe studenten bij eerste aanmelding',
      'Profielfoto uploaden (opgeslagen in database)',
      'Privacybeleid, algemene voorwaarden en gebruiksvoorwaarden toegevoegd',
      'Snelheidsbegrenzing (rate limiting) op inlogpogingen tegen misbruik',
      'Data-migratie tools voor het overzetten van bestaande daggegevens',
      'Taalkeuze en thema worden opgeslagen in de database',
      'Stabiliteitsfixes: avatar, JWT, migratie en dashboard',
    ],
    en: [
      'Full multi-user support: each student has their own isolated data',
      'Teacher dashboard with student switcher to view hours per student',
      'Onboarding flow for new students on first login',
      'Profile photo upload (stored in database)',
      'Privacy policy, terms of service, and terms of use pages added',
      'Rate limiting on login attempts to prevent abuse',
      'Data migration tools for transferring existing day data',
      'Language preference and theme saved to the database',
      'Stability fixes: avatar, JWT, migration, and dashboard',
    ],
  },
  {
    version: '3.4.4',
    date: '2026-02-24',
    nl: [
      'CI/CD verbeteringen: labeler workflow hersteld',
      'Datadog monitoring verwijderd',
      'Interne infrastructuur opgeschoond',
    ],
    en: [
      'CI/CD improvements: labeler workflow restored',
      'Datadog monitoring removed',
      'Internal infrastructure cleaned up',
    ],
  },
  {
    version: '3.4.5',
    date: '2026-02-24',
    nl: [
      'Kleine stabiliteitsfixes en interne verbeteringen',
    ],
    en: [
      'Minor stability fixes and internal improvements',
    ],
  },
  {
    version: '4.5.6',
    date: '2026-02-24',
    nl: [
      'Versie wordt nu betrouwbaar gelezen vanuit package.json',
      'Problemen met versienummer in productie opgelost',
    ],
    en: [
      'Version is now reliably read from package.json',
      'Version number issues in production resolved',
    ],
  },
  {
    version: '4.5.7',
    date: '2026-02-24',
    nl: [
      'Datum op juridische pagina\'s gecorrigeerd naar 24 februari 2026',
    ],
    en: [
      'Date on legal pages corrected to 24 February 2026',
    ],
  },
  {
    version: '4.6.0',
    date: '2026-02-24',
    nl: [
      'Changelog systeem: elke versie heeft een Nederlandstalige en Engelstalige changelog opgeslagen in de database',
      'Changelog-modal toegevoegd: bekijk de volledige versiegeschiedenis via de voettekst',
      '"Wat is er nieuw?"-melding verschijnt automatisch na een update',
      'Gelezen-status van changelogs bijgehouden in de browser (taalinvariant)',
      'Versiecontrole verbeterd: gebruikt nu een statisch version.json-bestand dat bij elke build wordt gegenereerd',
      'Versiecontrole-interval verhoogd van 2 naar 5 minuten',
      'Geen valse herlaadbeurten meer: pagina herlaadt alleen als er daadwerkelijk een nieuwe versie is',
      'Voettekst toont nu of de app up-to-date is',
      'Rol "Guest" vertaald naar "Gast" in de zijbalk en het profiel',
      'Stagegegevens verborgen voor Gast-accounts in het profiel',
      'Browsertabbladtitel altijd "ArcInternship", ongeacht de taal',
      'Versiecontrole actief op alle pagina\'s (ook privacy, gebruiksvoorwaarden en terms)',
    ],
    en: [
      'Changelog system: every version has a Dutch and English changelog stored in the database',
      'Changelog modal added: view the full version history via the footer',
      '"What\'s New" notification appears automatically after an update',
      'Read status of changelogs tracked in the browser (language-independent)',
      'Version detection improved: now uses a static version.json file generated at each build',
      'Version check interval increased from 2 to 5 minutes',
      'No more false reloads: page only reloads when there is actually a new version',
      'Footer now shows whether the app is up to date',
      'Role "Guest" correctly translated to "Gast" in Dutch sidebar and profile',
      'Internship fields hidden for Guest accounts in the profile',
      'Browser tab title always "ArcInternship" regardless of language',
      'Version check active on all pages (including privacy, terms of use, and terms)',
    ],
  },
  {
    version: '4.7.0',
    date: '2026-02-24',
    nl: [
      'E-mailadres wijzigen: gebruikers kunnen hun e-mailadres aanpassen in het profiel (wachtwoordbevestiging vereist)',
      'Uitnodigingspagina (/invite): deel een link waarmee anderen een account kunnen aanvragen',
      'Korte beschrijving van ArcInternship op de uitnodigingspagina met de belangrijkste functies',
      'Beheerders en docenten kunnen de uitnodigingslink kopiëren vanuit de instellingen',
      'TypeScript-compatibiliteitsfout in de changelog-modal opgelost',
    ],
    en: [
      'Email address change: users can update their email address in their profile (password confirmation required)',
      'Invite page (/invite): share a link so others can request an account',
      'Short description of ArcInternship on the invite page with the key features',
      'Admins and teachers can copy the invite link from the settings page',
      'TypeScript compatibility error in the changelog modal fixed',
    ],
  },
  {
    version: '4.8.0',
    date: '2026-02-24',
    nl: [
      'Persoonlijke uitnodigingslinks: elk account heeft een eigen unieke uitnodigingscode',
      'Beheerders kunnen in de gebruikerslijst zien wie iemand heeft uitgenodigd',
      'E-mail wijzigen en wachtwoord wijzigen samengevoegd in één beveiligingskaart in het profiel',
      'Daglogboek-migratie verwijderd uit de instellingen (gebruik voltooid)',
      'Changelog wordt nu automatisch geladen bij eerste gebruik (geen handmatige seed meer nodig)',
      '/favicon.png 404 opgelost',
    ],
    en: [
      'Personal invite links: every account has its own unique invite code',
      'Admins can see who invited whom in the user list',
      'Email change and password change merged into a single Security card in the profile',
      'Day log migration removed from settings (completed)',
      'Changelog now auto-seeds on first use (no manual seed required)',
      '/favicon.png 404 resolved',
    ],
  },
  {
    version: '4.8.1',
    date: '2026-02-24',
    nl: [
      'Knop "Stagdagen genereren" verwijderd uit de instellingen',
    ],
    en: [
      'Remove "Generate internship days" button from settings',
    ],
  },
  {
    version: '5.9.2',
    date: '2026-02-24',
    nl: [
      'Bevestigingsvenster bij verwijderen van gebruikers is nu een modal popup (geen browser alert meer)',
      'Gebruikers kunnen hun eigen account verwijderen via de profielpagina (verwijdert alle data)',
    ],
    en: [
      'Delete user confirmation is now a modal popup instead of a browser alert',
      'Users can delete their own account from the profile page (removes all data)',
    ],
  },
]
