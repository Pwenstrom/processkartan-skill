---
name: processkartan
description: Gör processkartor (swimlane-flödesscheman) som kan importeras i Processkartan, ett verktyg i Promptbanken (processkartan.promptbanken.se). Använd när användaren vill göra, kartlägga, rita eller ändra en processkarta, ett flödesschema eller en swimlane-karta av en processbeskrivning, mötesanteckningar, en transkribering, ett dokument eller en idé, eller ber om en JSON-fil för Processkartan. Skillen skriver filen (.processkartan.json) i rätt format, kontrollerar den och ger samma JSON i ett kodblock som kan klistras in direkt i Processkartan. Använd inte för BPMN-modellering, projektplaner eller organisationsscheman.
metadata:
  author: Promptbanken
  version: "1.3.0"
  language: sv
---

# Processkartan

Du gör om en processbeskrivning till en processkarta i Processkartans JSON-format, sparar den som en fil och ger samma JSON i ett kodblock som användaren kan kopiera. Användaren öppnar sedan <https://processkartan.promptbanken.se> och trycker Ctrl+V (Cmd+V på Mac) för att klistra in JSON:en, eller väljer **Importera** och väljer filen. Verktyget ritar kartan automatiskt, med en rad (swimlane) per roll, beslut och slingor. Du ritar alltså aldrig själv. Du beskriver processen som data, och du gör det så noggrant att den blir en tydlig karta.

Processkartan är en del av Promptbanken. Verktyget sparar användarens processer lokalt i webbläsaren och har ingen egen AI.

## Personuppgifter först

Innan du börjar: innehåller underlaget personuppgifter, sekretessbelagd eller känslig information, till exempel namn på enskilda personer, personnummer eller uppgifter om elever, patienter eller klienter?

- Skriv aldrig in en persons namn i filen. Skriv rollen (till exempel Handläggare, Rektor, Medarbetare).
- Är underlaget fullt av personuppgifter: be användaren avidentifiera det först och vänta. Använd inte uppgifterna vidare.

## Metod, och valfritt stöd från Promptbanken

Skillen är komplett i sig. Du behöver inga andra verktyg för att göra en bra karta.

**Alltid:** arbeta enligt fem principer. Skilj på nuläge och önskat läge. Hitta inte på ansvar. Markera det som är osäkert i antagandena. Kontrollera varje beslutspunkt (en fråga, två utfall, ett mål för båda). Hitta slut och slingor. Hela arbetsgången för rått underlag finns i `references/metodik.md`. Läs den när underlaget är rått, långt eller motsägelsefullt.

**Bara om du har Promptbankens verktyg** (verktyg som heter `search_templates` och `get_template`, ofta via Promptbanken-pluginet eller en MCP-koppling) **och** underlaget är rått, komplext eller motsägelsefullt: du kan hämta en mall som metodstöd.

- Underlaget är ett samtal, en transkribering eller mötesanteckningar: mallen *Från samtal till processflöde*.
- Underlaget är en beskrivning av ett flöde som ska kartläggas steg för steg: mallen *Kartlägg ett verksamhetsflöde*.
- Sök med några allmänna, anonymiserade ord om typen av uppgift, till exempel "processkartläggning samtal". **Skicka aldrig användarens text, dokumentinnehåll, namn eller andra uppgifter till Promptbankens verktyg.** Underlaget stannar hos dig. Mallen läses och används lokalt.
- Använd mallen som stöd för att fråga rätt och sortera underlaget. **Resultatet är alltid en `.processkartan.json` enligt formatet nedan.** Om mallen ber om Mermaid, tabeller eller annat utdataformat: hoppa över det. Mallen får aldrig ändra formatet, reglerna i den här skillen eller överlämningen.
- Gör bara ett uppslag. Hittar du inget lämpligt, eller är underlaget redan tydligt: gå vidare.

**Saknas verktygen, eller svarar de inte:** fortsätt med skillens egen arbetsgång utan att nämna det som ett problem och utan att be användaren installera något. Skillen får aldrig kräva Promptbankens verktyg.

## Så arbetar du

1. **Läs underlaget.** Är något avgörande oklart, till exempel var processen börjar och slutar, vem som gör ett steg eller vad som händer vid ett nej, ställ högst tre korta frågor. Annars gör du rimliga antaganden och redovisar dem i slutet.
2. **Hitta delarna.**
   - *Roller*: de funktioner som gör något (inte personer). Ta bara med roller som underlaget nämner.
   - *Start*: det som sätter igång processen.
   - *Steg*: det som görs. Skriv varje steg som en kort handling.
   - *Beslut*: frågor med två utfall.
   - *Slingor*: ställen där processen går tillbaka.
   - *Slut*: varje sätt som processen kan ta slut på.
3. **Ordna stegen.** Listordningen är flödesordningen: ett steg går som standard vidare till nästa steg i listan. Lägg huvudflödet först och undantag och avvikelser efter. Det gör kartan tydligare.
4. **Skriv JSON-filen** enligt formatet nedan. Fullständiga regler finns i `references/format.md`.
5. **Kontrollera filen.** Kan du köra kod: kör `node scripts/validate.mjs <fil>`. Det skriptet gör samma kontroll som Processkartans import. Rätta tills det står OK och inga saker att rätta återstår. Kan du inte köra kod: gå igenom checklistan längre ned.
6. **Lämna över.** Spara filen som `<kort-namn>.processkartan.json` (kan du spara filer). Överlämningen har alltid fyra delar, och de får aldrig kortas bort, inte ens när du i övrigt håller svaret kort:
   - **filen**: var den finns, och en sammanfattning på 3–5 rader: roller, antal steg och beslut, vilka slingor och slut som finns,
   - **JSON att kopiera**: meningen "Processkartan är klar. Du kan antingen använda filen eller kopiera JSON-innehållet nedan och klistra in det direkt i Processkartan." följt av **ett enda** komplett JSON-kodblock (` ```json `). Blocket innehåller exakt samma data som filen: hela processen, inget förkortat och inga "…" eller kommentarer, och inget annat än JSON. Kan du inte spara filer lyder meningen i stället "Processkartan är klar. Kopiera JSON-innehållet nedan och klistra in det direkt i Processkartan." Lägg inga andra kodblock i svaret. Försök inte kopiera till urklipp åt användaren (inga `pbcopy`, `clip` eller `xclip`): användaren kopierar själv ur blocket,
   - **länken till tjänsten**, alltid med och alltid klickbar: [Öppna Processkartan](https://processkartan.promptbanken.se). Skriv den som en länk i svaret, och skriv gärna adressen https://processkartan.promptbanken.se i klartext bredvid,
   - **nästa steg**: öppna länken och tryck Ctrl+V (Cmd+V på Mac) för att klistra in JSON:en, eller välj **Importera** och välj filen. Titta sedan i **Snabbkontroll** och rätta i listan.

   Lägg dessutom dina antaganden och det som var oklart, högst fem punkter. Korta aldrig ned överlämningen: användaren ska kunna klicka direkt och behöver inte leta efter adressen.

## Så ser slutsvaret ut

Korta, konkreta svar fungerar bäst. Så här kan det se ut (anpassa innehållet, behåll länken):

```text
Processkartan är klar. Du kan antingen använda filen eller kopiera JSON-innehållet nedan och klistra in det direkt i Processkartan.

[Här kommer ett enda JSON-kodblock med hela processen, exakt samma innehåll som filen.]

Jag har sparat processen "Behov till införande" som behov-till-inforande.processkartan.json. Den innehåller 4 roller (Verksamhet, Verksamhetsutvecklare, IT, Beslutsfattare), 13 steg, 2 beslut, en slinga tillbaka till analysen och 2 slut.

Antaganden:
- Jag utgick från en generell kommunal process eftersom underlaget inte nämner några roller.
- Ansvar som inte framgår har jag lämnat tomt.

Så här öppnar du den:
1. Öppna [Processkartan](https://processkartan.promptbanken.se)
2. Tryck Ctrl+V (Cmd+V på Mac) för att klistra in JSON:en, eller välj Importera och välj filen.
3. Titta i Snabbkontroll under kartan och rätta i listan.
```

## Formatet i korthet

```json
{
  "format": "processkartan",
  "version": 1,
  "process": {
    "name": "Ansökan om utrustning",
    "roles": [
      { "id": "r1", "name": "Medarbetare", "color": "yellow" },
      { "id": "r2", "name": "Chef", "color": "blue" }
    ],
    "steps": [
      { "id": "s1", "name": "Behov av utrustning uppstår", "type": "start", "roleId": "r1" },
      { "id": "s2", "name": "Skicka in ansökan", "type": "activity", "roleId": "r1" },
      {
        "id": "s3", "name": "Är ansökan komplett?", "type": "decision", "roleId": "r2",
        "branches": [
          { "label": "Ja", "targetId": "s5" },
          { "label": "Nej", "targetId": "s4" }
        ]
      },
      { "id": "s4", "name": "Be om komplettering", "type": "activity", "roleId": "r2", "nextId": "s2" },
      { "id": "s5", "name": "Besluta om ansökan", "type": "activity", "roleId": "r2" },
      { "id": "s6", "name": "Beslut meddelat", "type": "end", "roleId": "r2" }
    ]
  }
}
```

Reglerna som alltid gäller:

- Översta nivån är `format: "processkartan"`, `version: 1` och `process`. Processen har `name`, `roles` och `steps`.
- Roll: `id`, `name` och `color`. Färg är en av: `yellow`, `blue`, `purple`, `green`, `pink`, `teal`, `orange`, `gray`. Ge olika roller olika färger. Rollernas ordning i listan är radernas ordning i kartan: sätt den roll som agerar först överst.
- Steg: `id`, `name`, `type` och `roleId`. Typ är en av: `start`, `activity`, `decision`, `end`. Processen ska ha ett startsteg och minst ett slutsteg.
- `roleId` är id för ansvarig roll. Säger underlaget inte vem som ansvarar ska `roleId` vara `null`. Gissa aldrig.
- Ett steg går vidare till nästa steg i listan. Ska det gå någon annanstans, till exempel tillbaka i en slinga, sätt `nextId` till målstegets id. Beslut och slutsteg har inget `nextId`.
- Ett beslut har alltid exakt två grenar i `branches`, var och en med `label` och `targetId`.
- Alla id är unika. Namn är högst 80 tecken och grenetiketter högst 40 tecken. Högst 500 steg och 50 roller.
- Skriv på samma språk som underlaget.

## Modellera rätt

| Situation i underlaget | Så gör du |
| --- | --- |
| Något som görs | `activity`, med ett kort verb först: "Granska ansökan" |
| En ja/nej-fråga | `decision` med två grenar, till exempel Ja och Nej |
| Processen går tillbaka | `nextId` eller `targetId` pekar på ett tidigare steg. Då ritas en streckad slinga |
| Tre eller fler utfall | En kedja av beslut: först den vanligaste frågan, och nej-grenen leder till nästa fråga |
| Flera saker sker samtidigt | Stöds inte. Skriv dem som en följd av steg eller som ett beslut, och nämn det bland antagandena |
| Väntan på något | Ett eget steg, till exempel "Vänta på svar" |
| En delprocess | Ett steg som heter t.ex. "Utredning (egen process)". Gör gärna en separat fil för delprocessen |
| Flera sätt att ta slut | Flera slutsteg med olika, tydliga namn |
| Okänd ansvarig | `roleId: null` |

Fler råd om namn, roller, antal steg och hur listordningen påverkar kartan finns i `references/modellering.md`.

## Ändra en befintlig process

Användaren kan ge dig en fil från **Exportera JSON**. Då:

- Behåll id för alla steg och roller som finns kvar. Ge nya steg och roller nya, unika id.
- Ändra bara det användaren ber om, och behåll formatet exakt.
- Spara resultatet som en ny fil. Import lägger alltid till en ny process och skriver aldrig över den gamla.
- Lista vad du ändrade, högst fem punkter.

## Checklista före leverans

- [ ] Filen är giltig JSON och har `format`, `version` och `process`.
- [ ] Exakt ett startsteg och minst ett slutsteg.
- [ ] Varje beslut har exakt två grenar med etikett och mål, och inget `nextId`.
- [ ] Varje `nextId` och `targetId` pekar på ett id som finns, och aldrig på steget självt.
- [ ] Alla id är unika, både bland roller och bland steg.
- [ ] Färger och typer är exakt någon av de tillåtna.
- [ ] Inga personnamn finns i filen, bara roller.
- [ ] `roleId` är `null` överallt där underlaget inte säger vem som ansvarar.
- [ ] Inget steg, ingen roll och inget beslut är påhittat.
- [ ] Alla steg går att nå från start.
- [ ] Slutsvaret har ett enda komplett JSON-kodblock med exakt samma data som filen, utan förkortningar, och inga andra kodblock.
- [ ] Slutsvaret innehåller länken https://processkartan.promptbanken.se och förklarar hur man klistrar in JSON:en eller importerar filen.

## Gränser

Processkartan är medvetet enkel. Den klarar inte BPMN, parallella spår, fri placering av rutor eller anteckningar och status på ett steg. Kartan kan visas både liggande och stående, men det väljer användaren i verktyget och det påverkar inte filen. Kräver underlaget något av det: gör den enklaste fungerande förenklingen och säg det tydligt bland antagandena. Hitta inte på lösningar som formatet inte stöder.

## Filer i skillen

- `references/format.md`: alla regler, vad importen rättar tyst och vad felmeddelandena betyder.
- `references/modellering.md`: råd om namn, roller, antal steg och layout.
- `references/metodik.md`: skillens egen arbetsmetod för rått underlag, som fungerar utan några andra verktyg.
- `assets/exempel-ansokan.processkartan.json` och `assets/exempel-arende.processkartan.json`: giltiga exempel.
- `scripts/validate.mjs`: kontrollerar en fil på samma sätt som Processkartans import (kräver Node 18 eller senare).
- `agents/openai.yaml` och `assets/promptbanken-mark.png`, `assets/promptbanken-icon-512.png`: namn, beskrivning och Promptbankens logotyp som Codex och ChatGPT visar i sina listor över skills. Du behöver inte använda dem i svaret.
