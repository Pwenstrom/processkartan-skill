# Modellera en bra processkarta

Råd för att få en karta som är tydlig att läsa. Formatet och reglerna finns i `format.md`.

## Namn på steg

- Börja med ett verb: "Granska ansökan", "Skicka beslut", "Registrera ärendet".
- Håll namnet kort, gärna 3–7 ord. Ett namn får vara 80 tecken, men det visas i en ruta på upp till fyra rader. Kartan blir tydligare med korta namn.
- Skriv det som sker, inte vem som gör det. Vem som gör det står i rollen.
- Beslut skrivs som en fråga med frågetecken: "Är underlaget komplett?"
- Slutsteg beskriver läget processen slutar i: "Beslut meddelat", "Ärendet avslutat".
- Skriv inte uppgifter som hör hemma i ett dokument, till exempel systemnamn, mallnamn och regler, i stegets namn. Det finns ingen anteckningsruta på steget. Är en sådan detalj viktig: nämn den i din sammanfattning till användaren.

## Etiketter på grenar

- Ja och Nej fungerar för enkla frågor.
- Är svaret inte ja eller nej: skriv utfallet, till exempel "Komplett" och "Ofullständig". Håll etiketten under 40 tecken, helst under 25.
- Etiketten visas bredvid pilen. Lång text tar plats och gör kartan bredare.

## Roller

- En roll är en funktion, inte en person: Handläggare, Chef, Medborgare, Ekonomi.
- Ta bara med roller som underlaget nämner. Fyll inte på med roller som låter rimliga.
- Två till sex roller ger den tydligaste kartan. Fler än åtta gör kartan hög.
- Ordna rollerna efter när de först agerar. Den som startar processen står överst.
- Ge olika roller olika färger.
- Vet du inte vem som ansvarar för ett steg: `roleId: null`. Det är rätt svar. Steget hamnar på raden "Ingen ansvarig", och användarens Snabbkontroll visar att ansvaret saknas. Det är ofta just det som är intressant att upptäcka.

## Hur många steg?

- Sju till tjugo steg ger en karta som går att överblicka.
- Kartan växer åt sidan ungefär en kolumn per steg i en rak följd. Blir den för bred delar Processkartan den automatiskt i delar under varandra (Del 1 av 3 och så vidare), med samma roller som rader i varje del och bokstavsmarkörer (A, B, C …) där en koppling går från en del till en annan. Du behöver inte dela upp en lång process i flera filer för att kartan ska bli läsbar, och du ska inte skriva några markörer själv.
- Är processen mycket lång, över ungefär fyrtio steg, eller består den av tydliga faser: överväg ändå flera filer, till exempel en per fas, och låt sista steget i den första heta "Fortsätter i: Utredning".

## Listordningen styr kartan

- Ett steg går som standard till nästa steg i listan.
- Lägg huvudflödet, den väg som oftast tas, först. Lägg undantag och sidospår efter.
- Efter ett beslut: lägg stegen för den ena grenen direkt efter beslutet och den andra grenens steg efter dem. Låt varje gren sluta i `nextId` eller ett slutsteg om den inte ska fortsätta med nästa steg i listan.
- Använd slinga (en koppling bakåt) bara för en verklig upprepning, till exempel "begär komplettering och försök igen". Kopplingar framåt i listan gör kartan lugnare.

## Det som inte går att uttrycka

- **Parallella spår.** Om två saker sker samtidigt: skriv dem efter varandra i den ordning som är mest naturlig, eller använd ett beslut om det verkligen är en förgrening. Berätta det i dina antaganden.
- **Anteckningar och status på ett steg.** Finns inte.
- **Fri placering och lodrät layout.** Finns inte. Kartan ritas om automatiskt.

## Efter importen

Användaren tittar på **Snabbkontroll** under kartan. Den visar steg utan ansvarig, grenar utan mål, saknad start eller slut och steg som inte går att nå. Tala om för användaren att tomma roller är avsiktliga och inte ett fel i filen.
