export const translations = {
  nl: {
    // Common
    app: 'ArcInternship',
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    search: 'Zoeken',
    filter: 'Filter',
    export: 'Exporteren',
    loading: 'Laden...',
    success: 'Succesvol opgeslagen',
    error: 'Er is een fout opgetreden',
    confirm: 'Bevestigen',

    // Navigation
    dashboard: 'Dashboard',
    days: 'Dagen',
    exportPage: 'Export',
    settings: 'Instellingen',
    logout: 'Uitloggen',

    // Login
    login: 'Inloggen',
    loginTitle: 'Inloggen bij ArcInternship',
    loginSubtitle: 'Stage Uren Registratie',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    loginButton: 'Inloggen',
    loginError: 'Ongeldige inloggegevens',

    // Dashboard
    totalHours: 'Totaal Uren',
    completedHours: 'Gelopen Uren',
    remainingHours: 'Resterende Uren',
    percentage: 'Voortgang',
    completedDays: 'Afgeronde Dagen',
    remainingDays: 'Open Dagen',
    weekOverview: 'Weekoverzicht',
    targetHours: 'Doelstelling: 760 uur',
    internshipPeriod: 'Stageperiode',
    from: 'Van',
    to: 'Tot',

    // Day types
    werkdag: 'Werkdag',
    thuiswerk: 'Thuiswerk',
    vrij: 'Vrij',
    ziek: 'Ziek',
    feestdag: 'Feestdag',

    // Day fields
    date: 'Datum',
    day: 'Dag',
    week: 'Week',
    type: 'Type',
    startTime: 'Starttijd',
    endTime: 'Eindtijd',
    hours: 'Uren',
    activities: 'Activiteiten',
    complete: 'Compleet',
    incompleteOnly: 'Alleen onvolledig',

    // Days page
    daysTitle: 'Dagoverzicht',
    allTypes: 'Alle types',
    searchDate: 'Zoek op datum...',
    noResults: 'Geen resultaten gevonden',
    weekTotal: 'Week totaal',

    // Export
    exportTitle: 'Excel Export',
    exportDescription: 'Exporteer je stage-uren naar een Excel-bestand',
    exportButton: 'Downloaden als Excel',
    exportAll: 'Alle dagen',
    exportCompleted: 'Alleen afgeronde',
    exportRange: 'Datumbereik',
    exportSuccess: 'Export gedownload!',

    // Settings
    settingsTitle: 'Instellingen',
    users: 'Gebruikers',
    addUser: 'Gebruiker toevoegen',
    username: 'Gebruikersnaam',
    role: 'Rol',
    admin: 'Beheerder',
    guest: 'Gast',
    language: 'Taal',
    theme: 'Thema',
    lightMode: 'Lichte modus',
    darkMode: 'Donkere modus',
    createUser: 'Gebruiker aanmaken',
    userCreated: 'Gebruiker aangemaakt en e-mail verstuurd',
    deleteUser: 'Gebruiker verwijderen',
    confirmDelete: 'Weet je zeker dat je deze gebruiker wilt verwijderen?',

    // Footer
    footerText: 'Part of the ArcNode Network & Stinoo Network',
  },
  en: {
    // Common
    app: 'ArcInternship',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    loading: 'Loading...',
    success: 'Successfully saved',
    error: 'An error occurred',
    confirm: 'Confirm',

    // Navigation
    dashboard: 'Dashboard',
    days: 'Days',
    exportPage: 'Export',
    settings: 'Settings',
    logout: 'Logout',

    // Login
    login: 'Login',
    loginTitle: 'Login to ArcInternship',
    loginSubtitle: 'Internship Hours Registration',
    email: 'Email address',
    password: 'Password',
    loginButton: 'Login',
    loginError: 'Invalid credentials',

    // Dashboard
    totalHours: 'Total Hours',
    completedHours: 'Completed Hours',
    remainingHours: 'Remaining Hours',
    percentage: 'Progress',
    completedDays: 'Completed Days',
    remainingDays: 'Open Days',
    weekOverview: 'Week Overview',
    targetHours: 'Target: 760 hours',
    internshipPeriod: 'Internship Period',
    from: 'From',
    to: 'To',

    // Day types
    werkdag: 'Work Day',
    thuiswerk: 'Remote Work',
    vrij: 'Day Off',
    ziek: 'Sick',
    feestdag: 'Holiday',

    // Day fields
    date: 'Date',
    day: 'Day',
    week: 'Week',
    type: 'Type',
    startTime: 'Start Time',
    endTime: 'End Time',
    hours: 'Hours',
    activities: 'Activities',
    complete: 'Complete',
    incompleteOnly: 'Incomplete only',

    // Days page
    daysTitle: 'Day Overview',
    allTypes: 'All types',
    searchDate: 'Search by date...',
    noResults: 'No results found',
    weekTotal: 'Week total',

    // Export
    exportTitle: 'Excel Export',
    exportDescription: 'Export your internship hours to an Excel file',
    exportButton: 'Download as Excel',
    exportAll: 'All days',
    exportCompleted: 'Completed only',
    exportRange: 'Date range',
    exportSuccess: 'Export downloaded!',

    // Settings
    settingsTitle: 'Settings',
    users: 'Users',
    addUser: 'Add User',
    username: 'Username',
    role: 'Role',
    admin: 'Admin',
    guest: 'Guest',
    language: 'Language',
    theme: 'Theme',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    createUser: 'Create user',
    userCreated: 'User created and email sent',
    deleteUser: 'Delete user',
    confirmDelete: 'Are you sure you want to delete this user?',

    // Footer
    footerText: 'Part of the ArcNode Network & Stinoo Network',
  },
}

export type TranslationKey = keyof typeof translations.nl
export type Translations = typeof translations.nl
