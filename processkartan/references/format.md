# Processkartans importformat

Version 1. Filen är en JSON-fil. Rekommenderat filnamn: `<kort-namn>.processkartan.json`.

## Översta nivån

| Fält | Krav |
| --- | --- |
| `format` | Texten `"processkartan"` |
| `version` | Talet `1` |
| `process` | Ett objekt, se nedan |
| `exportedAt` | Valfritt. Ignoreras vid import |

## `process`

| Fält | Krav |
| --- | --- |
| `name` | Text, högst 80 tecken (längre kapas) |
| `roles` | Lista, högst 50 |
| `steps` | Lista, högst 500 |
| `id`, `createdAt`, `updatedAt` | Valfria. Id byts alltid ut vid import och tidsstämplar fylls i om de saknas |

## Roll

| Fält | Krav |
| --- | --- |
| `id` | Icke-tom text, unik bland rollerna |
| `name` | Text, högst 80 tecken |
| `color` | Exakt en av: `yellow`, `blue`, `purple`, `green`, `pink`, `teal`, `orange`, `gray` |

Rollernas ordning i listan är ordningen på raderna (swimlanes) i kartan, uppifrån och ned. Steg utan ansvarig hamnar på en egen rad, "Ingen ansvarig", längst ned.

## Steg

| Fält | Krav |
| --- | --- |
| `id` | Icke-tom text, unik bland stegen |
| `name` | Text, högst 80 tecken. Tomt namn visas som "(utan namn)" |
| `type` | Exakt en av: `start`, `activity`, `decision`, `end` |
| `roleId` | Id för en roll i `roles`, eller `null`. Utelämnat räknas som `null` |
| `nextId` | Bara för `start` och `activity`. Id för det steg som kommer härnäst. Utelämnat betyder nästa steg i listan |
| `branches` | Bara för `decision`. Exakt två grenar: `[{ "label": "Ja", "targetId": "s5" }, { "label": "Nej", "targetId": "s4" }]` |

Gren: `label` är text, högst 40 tecken. `targetId` är id för ett steg, eller `null` om målet inte är bestämt.

## Hur kopplingarna blir

- `start` och `activity`: en koppling, till `nextId` om det finns, annars till nästa steg i listan. Sista steget i listan utan `nextId` har ingen koppling.
- `decision`: en koppling per gren som har ett `targetId`.
- `end`: inga kopplingar.
- En koppling till ett steg som ligger tidigare i listan ritas streckad. Det är en slinga.
- Kartans kolumner följer listan: ett steg hamnar en kolumn till höger om det steg som leder fram till det. Steg som bara nås via en slinga tillbaka hamnar längst till vänster. Lägg därför huvudflödet först och undantag efter.

## Det importen rättar tyst

Filen avvisas inte för det här, men det är nästan alltid ett misstag som du ska rätta själv:

- `roleId` som inte finns bland rollerna blir `null`.
- `nextId` som pekar på ett okänt id, eller på steget självt, tas bort. Då går steget till nästa i listan.
- `nextId` på ett beslut eller slutsteg ignoreras.
- Ett beslut utan två giltiga grenar får grenarna Ja och Nej utan mål.
- `branches` på något annat än ett beslut ignoreras.
- Ett `targetId` som är okänt eller pekar på beslutet självt blir "inget mål".
- För långa namn och etiketter kapas.

## Det importen avvisar

Då visas ett felmeddelande och ingenting importeras.

| Meddelande | Betyder | Åtgärd |
| --- | --- | --- |
| Filen är inte giltig JSON. | Texten går inte att läsa som JSON | Skicka bara JSON. Tomma kommatecken, saknade citattecken och löpande text i filen ger det här |
| Filen är inte en Processkartan-fil. | `format` saknas eller är inte `"processkartan"` | Lägg `format` överst |
| Filen kommer från en nyare version av Processkartan. | `version` är större än 1 | Sätt `version` till 1 |
| Filens version stöds inte. | `version` saknas eller är något annat än 1 | Skriv `version: 1` |
| Filen har fel format: steg 4. | Det angivna steget eller rollen har fel form: okänd `type` eller `color`, dubblerat `id` eller saknat `name` | Rätta det angivna steget eller rollen |
| Filen är för stor: högst 500 steg och 50 roller. | För många steg eller roller | Dela upp processen |

Filen får vara högst 1 MB. Processkartan klarar att filen börjar med en osynlig BOM-markering och att JSON:en ligger i ett Markdown-kodblock med text runt omkring, men skicka helst bara ren JSON.
