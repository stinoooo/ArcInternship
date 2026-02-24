import { LegalLayout } from '@/components/layout/LegalLayout'

export const metadata = {
  title: 'ArcInternship – Use',
  description: 'Usage rules for the ArcInternship platform',
}

export default function UsePage() {
  return (
    <LegalLayout title="Gebruiksvoorwaarden" lastUpdated="23 februari 2026">
      <div className="legal-box">
        <p>
          Deze gebruiksvoorwaarden beschrijven de regels en gedragsnormen die van toepassing
          zijn op het gebruik van ArcInternship. Zij vormen een aanvulling op de servicevoorwaarden
          en het privacybeleid. Door gebruik te maken van het platform stemt u in met deze
          gebruiksvoorwaarden.
        </p>
      </div>

      <h2>Artikel 1 – Doel van het platform</h2>
      <p>
        ArcInternship is uitsluitend bestemd voor het registreren, bijhouden en raadplegen van
        stageuren en stageactiviteiten door studenten, docenten en beheerders in het kader
        van een erkende stageperiode. Ieder ander gebruik is niet toegestaan, tenzij de
        exploitant hiervoor voorafgaand schriftelijke toestemming heeft verleend.
      </p>

      <h2>Artikel 2 – Accountverantwoordelijkheid</h2>
      <p>
        Ieder account is persoonlijk en gekoppeld aan één gebruiker. De houder van een
        account is volledig verantwoordelijk voor alle handelingen die worden verricht
        via dat account, ongeacht of deze door hemzelf of door een derde zijn verricht.
      </p>
      <h3>2.1 Verplichtingen van de accounthouder</h3>
      <ul>
        <li>
          U dient uw inloggegevens (e-mailadres en wachtwoord) vertrouwelijk te houden en
          niet te delen met derden.
        </li>
        <li>
          U dient de exploitant onverwijld te informeren zodra u vermoedt dat uw account
          ongeoorloofd is gebruikt.
        </li>
        <li>
          U mag geen account aanmaken of gebruiken in naam van een andere persoon, tenzij
          u daartoe rechtsgeldig gemachtigd bent.
        </li>
        <li>
          U mag niet meer dan één account aanmaken zonder uitdrukkelijke toestemming van
          de exploitant.
        </li>
        <li>
          U dient uw profielgegevens (e-mailadres, naam, stageplek e.d.) actueel en
          correct te houden.
        </li>
      </ul>

      <h2>Artikel 3 – Verplichte juistheid van ingevoerde gegevens</h2>
      <p>
        ArcInternship dient als officieel registratiesysteem voor stageuren. De betrouwbaarheid
        van de geregistreerde gegevens is essentieel.
      </p>
      <ul>
        <li>
          U bent verplicht uitsluitend juiste, nauwkeurige en eerlijke gegevens in te voeren.
          Het registreren van niet-gewerkte uren, het opvoeren van fictieve activiteiten of
          het anderszins manipuleren van uw logboek is uitdrukkelijk verboden.
        </li>
        <li>
          Het invullen van stagegegevens door een ander persoon (tenzij dit door de instelling
          uitdrukkelijk is toegestaan, bijvoorbeeld door een begeleider) is niet toegestaan.
        </li>
        <li>
          De exploitant en uw onderwijsinstelling behouden het recht zich te wenden tot de
          bevoegde autoriteiten bij vermoedens van fraude of valsheid in geschriften.
        </li>
      </ul>

      <h2>Artikel 4 – Verboden activiteiten</h2>
      <p>
        Het is ten strengste verboden het platform te gebruiken voor of in verband met:
      </p>
      <h3>4.1 Veiligheid en integriteit</h3>
      <ul>
        <li>
          Het proberen te omzeilen van beveiligingsmaatregelen of authenticatiemechanismen
          van het platform.
        </li>
        <li>
          Het proberen toegang te verkrijgen tot accounts, gegevens of systemen waartoe u
          geen toestemming heeft.
        </li>
        <li>
          Het uitvoeren of faciliteren van aanvallen op de infrastructuur van het platform,
          waaronder begrepen maar niet beperkt tot: SQL-injectie, cross-site scripting (XSS),
          denial-of-service-aanvallen of brute-force-aanvallen.
        </li>
        <li>
          Het reverse-engineeren, decompileren of anderszins analyseren van de broncode
          van het platform zonder uitdrukkelijke schriftelijke toestemming.
        </li>
        <li>
          Het geautomatiseerd benaderen van het platform (scraping, crawling of geautomatiseerde
          scripts), tenzij dit uitdrukkelijk is toegestaan via de API en u daarvoor
          geautoriseerd bent.
        </li>
        <li>
          Het uploaden of verspreiden van malware, virussen of andere schadelijke code.
        </li>
      </ul>

      <h3>4.2 Inhoud en communicatie</h3>
      <ul>
        <li>
          Het invoeren van lasterlijke, beledigende, discriminerende, racistische, seksistische
          of anderszins onrechtmatige inhoud in activiteitsomschrijvingen of profielvelden.
        </li>
        <li>
          Het vermelden van persoonsgegevens van derden (zoals volledige namen, adressen of
          contactgegevens van collega&apos;s) tenzij dit strikt noodzakelijk is voor een
          correcte beschrijving van stageactiviteiten en u daartoe gerechtigd bent.
        </li>
        <li>
          Het invoeren van inhoud die inbreuk maakt op intellectuele eigendomsrechten van derden.
        </li>
        <li>
          Ieder gebruik dat strijdig is met de openbare orde of de goede zeden.
        </li>
      </ul>

      <h3>4.3 Commercieel en overig misbruik</h3>
      <ul>
        <li>
          Het gebruiken van het platform voor commerciële doeleinden anders dan waarvoor
          het is ingericht, waaronder reclame of marketing.
        </li>
        <li>
          Het doorverkopen of sublicentiëren van toegang tot het platform aan derden.
        </li>
        <li>
          Het gebruik van het platform op een wijze die de exploitant of andere gebruikers
          schaadt of kan schaden.
        </li>
      </ul>

      <h2>Artikel 5 – Inhoud ingevoerd door gebruikers</h2>
      <p>
        U bent als gebruiker zelf verantwoordelijk voor alle inhoud die u invoert op het
        platform, waaronder stagelogboeken en activiteitsomschrijvingen. U garandeert dat:
      </p>
      <ul>
        <li>de door u ingevoerde inhoud waarheidsgetrouw en accuraat is;</li>
        <li>
          u gerechtigd bent deze inhoud in te voeren en dat dit geen inbreuk maakt op
          rechten van derden;
        </li>
        <li>
          de inhoud geen persoonsgegevens bevat die u zonder rechtsgrond openbaar maakt.
        </li>
      </ul>
      <p>
        De exploitant is niet verantwoordelijk voor de juistheid of volledigheid van door
        gebruikers ingevoerde gegevens en aanvaardt daarvoor geen aansprakelijkheid.
      </p>

      <h2>Artikel 6 – Rollen en toegangsrechten</h2>
      <p>
        ArcInternship hanteert een rolgebaseerd systeem met de rollen <em>beheerder</em> en
        <em> gast</em>. Elke rol heeft specifieke bevoegdheden:
      </p>
      <ul>
        <li>
          <strong>Beheerder:</strong> heeft volledige toegang tot het systeem, inclusief
          gebruikersbeheer en het bewerken van stagegegevens.
        </li>
        <li>
          <strong>Gast:</strong> kan stagegegevens inzien. Heeft geen bewerkingsrechten.
        </li>
      </ul>
      <p>
        Het is de gebruiker niet toegestaan te proberen rechten of toegang te verkrijgen
        buiten de eigen rol. Iedere poging daartoe wordt beschouwd als een schending van
        deze gebruiksvoorwaarden en de toepasselijke wetgeving.
      </p>

      <h2>Artikel 7 – Meldingsplicht bij incidenten</h2>
      <p>
        Indien u een beveiligingslek, kwetsbaarheid of onrechtmatige toegang constateert,
        bent u verplicht dit onmiddellijk te melden bij de exploitant via het e-mailadres
        vermeld in het privacybeleid. Wij verzoeken u dergelijke bevindingen verantwoord te
        melden (responsible disclosure) en de kwetsbaarheid niet te misbruiken of openbaar
        te maken voordat de exploitant de gelegenheid heeft gehad de situatie te verhelpen.
      </p>

      <h2>Artikel 8 – Handhaving en sancties</h2>
      <p>
        Bij schending van deze gebruiksvoorwaarden is de exploitant gerechtigd, zonder
        voorafgaande kennisgeving en zonder aansprakelijkheid jegens de gebruiker, de
        volgende maatregelen te treffen:
      </p>
      <ul>
        <li>het tijdelijk of permanent deactiveren van het account van de gebruiker;</li>
        <li>het verwijderen van inhoud die in strijd is met deze voorwaarden;</li>
        <li>
          het beperken van de toegang tot bepaalde functionaliteiten van het platform;
        </li>
        <li>
          het informeren van de onderwijsinstelling, werkgever of bevoegde autoriteiten
          bij vermoedens van fraude of strafbare gedragingen.
        </li>
      </ul>
      <p>
        De exploitant is niet verplicht de gebruiker voorafgaand aan of tegelijk met
        deze maatregelen te informeren, indien dit gezien de ernst van de overtreding
        niet redelijkerwijs kan worden gevergd.
      </p>

      <h2>Artikel 9 – Klachten en geschillen</h2>
      <p>
        Klachten over de toepassing van deze gebruiksvoorwaarden of over het functioneren
        van het platform kunnen worden ingediend bij de exploitant via het contactadres
        vermeld in het privacybeleid. Klachten worden in beginsel binnen veertien (14)
        werkdagen behandeld.
      </p>
      <p>
        Op geschillen is uitsluitend Nederlands recht van toepassing. Zie ook artikel 11
        van de servicevoorwaarden.
      </p>

      <h2>Artikel 10 – Verband met andere documenten</h2>
      <p>
        Deze gebruiksvoorwaarden dienen te worden gelezen in samenhang met de
        servicevoorwaarden en het privacybeleid van ArcInternship. Bij strijdigheid tussen
        deze documenten geldt de volgende rangorde:
      </p>
      <ol>
        <li>Servicevoorwaarden</li>
        <li>Privacybeleid</li>
        <li>Gebruiksvoorwaarden</li>
      </ol>
      <p>
        De meest recente versie van elk document is te vinden via de links in de voettekst
        van deze pagina. Ouder versies worden niet bewaard voor raadpleging door gebruikers,
        maar zijn op verzoek opvraagbaar bij de exploitant.
      </p>
    </LegalLayout>
  )
}
