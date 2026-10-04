# Ändringslogg

Alla märkbara ändringar i Processkartan Skill. Formatet följer [Keep a Changelog](https://keepachangelog.com/sv/1.1.0/) och versionerna är [semantiska](https://semver.org/lang/sv/). Versionen står i `processkartan/SKILL.md` och en release tas fram genom att tagga `v<version>`.

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
