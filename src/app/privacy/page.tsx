import { LegalLayout } from '@/components/layout/LegalLayout'

export const metadata = {
  title: 'ArcInternship – Privacy',
  description: 'Privacybeleid van ArcInternship conform de AVG (GDPR)',
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacybeleid" lastUpdated="23 februari 2026">
      <div className="legal-box">
        <p>
          Dit privacybeleid is van toepassing op alle persoonsgegevens die worden verwerkt door
          de beheerder van ArcInternship in het kader van de dienstverlening. Lees dit document
          zorgvuldig. Bij vragen kunt u contact opnemen via het onderstaande e-mailadres.
        </p>
      </div>

      <h2>1. Identiteit van de verwerkingsverantwoordelijke</h2>
      <p>
        De verantwoordelijke voor de verwerking van uw persoonsgegevens in de zin van de
        Algemene Verordening Gegevensbescherming (AVG, Verordening (EU) 2016/679) is:
      </p>
      <ul>
        <li><strong>Naam:</strong> [NAAM ORGANISATIE / NAAM BEHEERDER]</li>
        <li><strong>Adres:</strong> [STRAAT EN HUISNUMMER, POSTCODE, STAD]</li>
        <li><strong>KvK-nummer:</strong> [KVK-NUMMER]</li>
        <li><strong>E-mailadres:</strong> [CONTACT@UW-DOMEIN.NL]</li>
        <li><strong>Telefoonnummer:</strong> [TELEFOONNUMMER]</li>
      </ul>
      <p>
        Wij hebben geen functionaris voor gegevensbescherming (FG) aangesteld. Voor vragen
        over de verwerking van uw persoonsgegevens kunt u rechtstreeks contact opnemen via
        bovenstaand e-mailadres.
      </p>

      <h2>2. Welke persoonsgegevens verwerken wij?</h2>
      <p>
        In het kader van de werking van het platform ArcInternship worden de volgende
        categorieën persoonsgegevens verwerkt:
      </p>

      <h3>2.1 Accountgegevens</h3>
      <ul>
        <li>E-mailadres</li>
        <li>Gebruikersnaam</li>
        <li>Wachtwoord (uitsluitend opgeslagen als niet-omkeerbare cryptografische hash; het wachtwoord zelf is nooit leesbaar opgeslagen)</li>
        <li>Gebruikersrol (student, docent, beheerder)</li>
        <li>Accountstatus (goedgekeurd / niet goedgekeurd)</li>
        <li>Datum en tijd van aanmaken en laatste wijziging van het account</li>
      </ul>

      <h3>2.2 Profielgegevens</h3>
      <ul>
        <li>Voorkeurstaal (Nederlands of Engels)</li>
        <li>Voorkeur voor kleurthema (licht of donker)</li>
        <li>Profielfoto (optioneel; opgeslagen als gecodeerde afbeeldingsdata)</li>
        <li>Stageplek (naam van het stagebedrijf)</li>
        <li>Naam van de onderwijsinstelling</li>
        <li>E-mailadres van de student (kan afwijken van het loginadres)</li>
        <li>Naam en contactgegevens van de stagebegeleider</li>
        <li>Verwacht aantal stageuren</li>
        <li>Startdatum en einddatum van de stage</li>
      </ul>

      <h3>2.3 Stagelogboekgegevens</h3>
      <ul>
        <li>Datum van de betreffende dag</li>
        <li>Dag van de week en weeknummer</li>
        <li>Type dag (werkdag, thuiswerk, vrij, ziek, feestdag)</li>
        <li>Begin- en eindtijd van de werkdag</li>
        <li>Aantal geregistreerde uren</li>
        <li>Beschrijving van uitgevoerde activiteiten</li>
        <li>Afrondingsstatus van de dag</li>
      </ul>

      <h3>2.4 Technische en sessiegegevens</h3>
      <ul>
        <li>Sessietokens voor authenticatie (opgeslagen in JWT-cookies)</li>
        <li>IP-adres (tijdelijk verwerkt door de webserver; niet apart opgeslagen in de database)</li>
      </ul>

      <h2>3. Doeleinden en grondslagen van de verwerking</h2>
      <p>
        Wij verwerken uw persoonsgegevens uitsluitend voor de hieronder omschreven doeleinden
        en op basis van de genoemde rechtsgrondslagen uit artikel 6 van de AVG.
      </p>

      <h3>3.1 Uitvoering van de overeenkomst (artikel 6 lid 1 sub b AVG)</h3>
      <p>
        De verwerking van accountgegevens, profielgegevens en stagelogboekgegevens is
        noodzakelijk voor het verlenen van de dienst: het bijhouden en inzichtelijk maken van
        stageuren voor studenten en het bieden van overzichten aan begeleiders en beheerders.
        Zonder deze verwerking kan de dienst niet worden geleverd.
      </p>

      <h3>3.2 Gerechtvaardigd belang (artikel 6 lid 1 sub f AVG)</h3>
      <p>
        Wij verwerken technische sessiegegevens op basis van ons gerechtvaardigde belang bij
        het waarborgen van de beveiliging van het platform, het voorkomen van ongeautoriseerde
        toegang en het handhaven van de integriteit van de gegevens. Dit belang weegt zwaarder
        dan de privacybelangen van gebruikers, gelet op de beperkte aard van de verwerking
        en de maatregelen die wij treffen om uw gegevens te beschermen.
      </p>

      <h2>4. Bewaartermijnen</h2>
      <p>
        Wij bewaren persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor
        zij zijn verzameld. De volgende bewaartermijnen gelden:
      </p>
      <ul>
        <li>
          <strong>Accountgegevens en profielgegevens:</strong> zolang het account actief is,
          vermeerderd met een periode van maximaal twaalf (12) maanden na deactivering of
          verwijdering van het account, of korter indien u eerder een verzoek tot verwijdering
          indient.
        </li>
        <li>
          <strong>Stagelogboekgegevens:</strong> zolang het account actief is. Na verwijdering
          van het account worden ook de bijbehorende logboekgegevens verwijderd, tenzij wij
          op grond van een wettelijke bewaarplicht gehouden zijn de gegevens langer te bewaren.
        </li>
        <li>
          <strong>Technische sessiegegevens:</strong> sessietokens verlopen automatisch na
          dertig (30) dagen van inactiviteit of na uitloggen.
        </li>
      </ul>

      <h2>5. Ontvangers van persoonsgegevens</h2>
      <p>
        Uw persoonsgegevens worden niet verkocht, verhuurd of anderszins aan derden
        verstrekt, behoudens de volgende uitzonderingen:
      </p>
      <ul>
        <li>
          <strong>Hostingprovider:</strong> de technische infrastructuur waarop ArcInternship draait
          wordt beheerd door een externe hostingprovider. Deze partij treedt op als
          verwerker in de zin van de AVG en verwerkt uw gegevens uitsluitend in opdracht van
          ons en op basis van een verwerkersovereenkomst die voldoet aan de eisen van artikel
          28 AVG.
        </li>
        <li>
          <strong>Wettelijke verplichting:</strong> indien wij daartoe wettelijk verplicht zijn
          of op last van een bevoegde autoriteit, kunnen wij gegevens verstrekken aan
          overheidsinstanties of rechterlijke instanties.
        </li>
      </ul>
      <p>
        Uw persoonsgegevens worden niet doorgegeven aan landen buiten de Europese Economische
        Ruimte (EER), tenzij dit noodzakelijk is en er passende waarborgen gelden conform
        hoofdstuk V van de AVG.
      </p>

      <h2>6. Beveiliging</h2>
      <p>
        Wij treffen passende technische en organisatorische maatregelen om uw persoonsgegevens
        te beschermen tegen verlies, ongeautoriseerde toegang, openbaarmaking, wijziging of
        vernietiging. Deze maatregelen omvatten onder meer:
      </p>
      <ul>
        <li>Versleuteling van alle verbindingen via TLS (HTTPS)</li>
        <li>Cryptografische hashing van wachtwoorden (bcrypt)</li>
        <li>Sessiebeheer via ondertekende JSON Web Tokens (JWT)</li>
        <li>Rolgebaseerde toegangscontrole: studenten hebben alleen toegang tot hun eigen gegevens</li>
        <li>Beperkte toegang tot de database voor geautoriseerde systemen</li>
        <li>Snelheidsbegrenzing (rate limiting) op inlogpogingen</li>
      </ul>

      <h2>7. Uw rechten als betrokkene</h2>
      <p>
        Op grond van de AVG heeft u de volgende rechten met betrekking tot uw persoonsgegevens.
        U kunt deze rechten uitoefenen door contact met ons op te nemen via het e-mailadres
        vermeld in artikel 1. Wij reageren binnen één maand op uw verzoek. Deze termijn kan
        met maximaal twee maanden worden verlengd bij complexe of meervoudige verzoeken,
        waarbij wij u hierover tijdig informeren.
      </p>

      <h3>7.1 Recht van inzage (artikel 15 AVG)</h3>
      <p>
        U heeft het recht om te verzoeken om inzage in de persoonsgegevens die wij van u
        verwerken, alsmede informatie over de verwerkingsdoeleinden, categorieën van gegevens,
        ontvangers en bewaartermijnen.
      </p>

      <h3>7.2 Recht op rectificatie (artikel 16 AVG)</h3>
      <p>
        U heeft het recht onjuiste of onvolledige persoonsgegevens te laten corrigeren.
        U kunt uw accountgegevens en profielgegevens ook zelf aanpassen via de instellingen
        in de applicatie.
      </p>

      <h3>7.3 Recht op verwijdering ('recht op vergetelheid', artikel 17 AVG)</h3>
      <p>
        U heeft het recht ons te verzoeken uw persoonsgegevens te wissen, mits daarvoor een
        grondslag bestaat. Dit recht geldt niet indien wij de gegevens nodig hebben voor de
        uitvoering van een overeenkomst of ter nakoming van een wettelijke verplichting.
      </p>

      <h3>7.4 Recht op beperking van de verwerking (artikel 18 AVG)</h3>
      <p>
        In bepaalde omstandigheden heeft u het recht de verwerking van uw persoonsgegevens
        te laten beperken, bijvoorbeeld wanneer u de juistheid van de gegevens betwist of
        bezwaar heeft gemaakt tegen de verwerking.
      </p>

      <h3>7.5 Recht op gegevensoverdraagbaarheid (artikel 20 AVG)</h3>
      <p>
        U heeft het recht uw persoonsgegevens in een gestructureerd, gangbaar en
        machineleesbaar formaat te ontvangen of te laten overdragen aan een andere
        verwerkingsverantwoordelijke, voor zover de verwerking is gebaseerd op toestemming
        of een overeenkomst en geautomatiseerd plaatsvindt. U kunt uw stagelogboek
        exporteren via de exportfunctie in de applicatie.
      </p>

      <h3>7.6 Recht van bezwaar (artikel 21 AVG)</h3>
      <p>
        U heeft het recht bezwaar te maken tegen de verwerking van uw persoonsgegevens
        op basis van gerechtvaardigde belangen. Wij staken dan de verwerking, tenzij wij
        dwingende gerechtvaardigde gronden aanvoeren die zwaarder wegen dan uw belangen,
        rechten en vrijheden.
      </p>

      <h2>8. Klachten</h2>
      <p>
        Indien u van mening bent dat wij uw persoonsgegevens niet in overeenstemming met
        de AVG verwerken, heeft u het recht een klacht in te dienen bij de bevoegde
        toezichthoudende autoriteit in Nederland:
      </p>
      <ul>
        <li><strong>Autoriteit Persoonsgegevens (AP)</strong></li>
        <li>Postbus 93374, 2509 AJ Den Haag</li>
        <li>Telefoon: 088 – 1805 250</li>
        <li>Website: <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</a></li>
      </ul>
      <p>
        Wij verzoeken u echter om eerst contact met ons op te nemen als u een klacht heeft,
        zodat wij samen tot een oplossing kunnen komen.
      </p>

      <h2>9. Geautomatiseerde besluitvorming</h2>
      <p>
        ArcInternship past geen geautomatiseerde besluitvorming of profilering toe als bedoeld
        in artikel 22 van de AVG. Alle beoordelingen van stagegegevens worden door
        mensen (begeleiders of beheerders) uitgevoerd.
      </p>

      <h2>10. Cookies</h2>
      <p>
        ArcInternship maakt gebruik van een functionele sessiecookie (HttpOnly, Secure) die
        noodzakelijk is voor authenticatie en het bijhouden van uw inlogsessie. Deze cookie
        bevat een JWT-token en is strikt functioneel; er worden geen tracking- of
        analysecookies geplaatst.
      </p>
      <p>
        Omdat de cookie uitsluitend functioneel van aard is, is hiervoor geen toestemming
        vereist op grond van artikel 11.7a van de Telecommunicatiewet.
      </p>

      <h2>11. Wijzigingen in dit privacybeleid</h2>
      <p>
        Wij behouden ons het recht voor dit privacybeleid te wijzigen. Bij wezenlijke
        wijzigingen worden gebruikers hierover geïnformeerd via de applicatie of per e-mail.
        De datum van de laatste wijziging is bovenaan dit document vermeld. Wij adviseren
        u dit beleid regelmatig te raadplegen.
      </p>

      <h2>12. Toepasselijk recht</h2>
      <p>
        Op dit privacybeleid is het Nederlands recht van toepassing. Eventuele geschillen
        worden voorgelegd aan de bevoegde rechter in Nederland.
      </p>
    </LegalLayout>
  )
}
