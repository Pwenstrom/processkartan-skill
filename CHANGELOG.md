# Ändringslogg

Alla märkbara ändringar i Processkartan Skill. Formatet följer [Keep a Changelog](https://keepachangelog.com/sv/1.1.0/) och versionerna är [semantiska](https://semver.org/lang/sv/). Versionen står i `processkartan/SKILL.md` och en release tas fram genom att tagga `v<version>`.

## [1.3.0] - 2026-10-04

### Nytt
- Överlämningen innehåller nu ett enda komplett JSON-kodblock med exakt samma data som filen, efter meningen "Processkartan är klar. Du kan antingen använda filen eller kopiera JSON-innehållet nedan och klistra in det direkt i Processkartan." Användaren kopierar blocket och trycker Ctrl+V (Cmd+V på Mac) i Processkartan, utan fil. Filen skapas som förut.
- Kan agenten inte spara filer räcker kodblocket.
- Skillen kopierar aldrig till urklipp åt användaren (inga `pbcopy`, `clip` eller `xclip`): kopieringen görs av användaren, så att den fungerar i ChatGPT, Codex, Claude och Claude Code.
- `references/format.md` beskriver vad som gäller när något klistras in och de två nya felmeddelandena.

### Ändrat
- Gränserna säger inte längre att lodrät layout saknas. Processkartan kan visa kartan stående, och det påverkar inte filen.

## [1.2.0] - 2026-10-04

### Nytt
- Skillen är MCP-medveten, men bara som ett tillägg. Har agenten Promptbankens verktyg `search_templates` och `get_template` och underlaget är rått, långt eller motsägelsefullt kan den hämta mallen *Från samtal till processflöde* eller *Kartlägg ett verksamhetsflöde* som metodstöd. Skillen fungerar fullt ut utan dem och får aldrig kräva dem.
- Din text skickas aldrig till Promptbankens verktyg, bara allmänna sökord om typen av uppgift.
- `references/metodik.md`: skillens egen arbetsmetod för rått underlag (nuläge och önskat läge, inga påhittade ansvar, osäkerheter i antagandena, kontroll av beslutspunkter).

## [1.1.0] - 2026-10-04

### Nytt
- Överlämningen har tre delar som aldrig får kortas bort: filen, en klickbar länk till Processkartan och nästa steg. Ett exempel på slutsvar och en punkt i checklistan kräver länken.
- Promptbankens märke och appikon följer med, tillsammans med `agents/openai.yaml` (namn, beskrivning, ikoner och märkesfärg) som Codex och ChatGPT visar i sina listor.

### Ändrat
- Reservprompterna kräver också länken till tjänsten.

## [1.0.0] - 2026-10-04

### Nytt
- Första versionen. Gör processkartor (swimlane-flödesscheman) av processbeskrivningar och skriver dem som `.processkartan.json` för import i Processkartan.
- Formatbeskrivning, råd om modellering och två exempelfiler.
- `scripts/validate.mjs` kontrollerar en fil på samma sätt som Processkartans import.
