# Processkartan Skill

En skill som låter ChatGPT (och Codex och Claude Code) göra processkartor åt dig. Den omvandlar en processbeskrivning, mötesanteckningar eller en idé till Processkartans format och skapar en fil som slutar på `.processkartan.json`. Filen drar du direkt till [processkartan.promptbanken.se](https://processkartan.promptbanken.se), som ritar kartan automatiskt med en rad per roll, beslut och slingor.

Processkartan är en del av [Promptbanken](https://app.promptbanken.se).

## Installera Processkartan Skill

1. Ladda ner **`skill.zip`** från [senaste GitHub Release](../../releases/latest).
2. Öppna ChatGPT.
3. Öppna Skills/Plugins och skapa eller ladda upp en Skill.
4. Välj `skill.zip`.
5. Testa, till exempel:

   > Gör en processkarta av den här processbeskrivningen.

Packa inte upp filen. ChatGPT vill ha själva `skill.zip`, som har en enda toppmapp (`processkartan/`).

Menyernas namn och vilka abonnemang som kan använda skills bestäms av OpenAI och kan ändras. Stämmer stegen ovan inte, följ [OpenAI:s hjälpartikel om skills i ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt).

För Claude Code och Codex: packa upp zippen och lägg mappen `processkartan` i `~/.claude/skills/` respektive `~/.agents/skills/` (eller `.claude/skills/` och `.agents/skills/` i ett enskilt projekt).

## Så använder du den

1. Ge agenten ditt **avidentifierade** underlag och be om en processkarta.
2. Agenten skriver en fil som slutar på `.processkartan.json`, kontrollerar den och ger dig den.
3. Öppna [Processkartan](https://processkartan.promptbanken.se) och **dra filen** till fönstret, eller välj **Importera**.
4. Titta i Snabbkontroll och rätta i listan. Roller som underlaget inte nämnde lämnas tomma med flit.

Skillen skickar ingenting någonstans och Processkartan har ingen egen AI. Klistra inte in personuppgifter eller sekretessbelagd information i externa AI-verktyg.

## Kontrollera nedladdningen (frivilligt)

Det här är inget krav för att installera. Det är för dig som vill vara säker på att filen är orörd. Varje release har en fil, `SHA256SUMS`, med kontrollsumman för `skill.zip`.

```bash
sha256sum -c SHA256SUMS      # Linux och Git Bash
shasum -a 256 -c SHA256SUMS  # macOS
```

I PowerShell: `(Get-FileHash skill.zip -Algorithm SHA256).Hash` ska vara samma som i `SHA256SUMS`.

Filen byggs reproducerbart: samma källkod ger exakt samma `skill.zip`, så du kan också bygga den själv (se nedan) och jämföra.

## Innehåll

```
processkartan/
  SKILL.md              instruktionerna till agenten
  agents/openai.yaml    namn, beskrivning och ikoner som ChatGPT och Codex visar
  references/           formatet, råd om modellering och arbetsmetod
  scripts/validate.mjs  kontrollerar en processfil (kräver Node 18 eller senare)
  assets/               exempelfiler och Promptbankens logotyp
tools/                  verktyg för att bygga och släppa skillen (ingår inte i skill.zip)
```

## Bygga och släppa

Kräver Node 20 eller senare. Inga beroenden.

```bash
npm run validate      # kontrollerar skillen
npm run build         # skriver dist/skill.zip och dist/SHA256SUMS
npm run release:dry   # torrkörning av hela releaseflödet, publicerar ingenting
```

En release görs genom att höja `version` i `processkartan/SKILL.md`, lägga ett avsnitt för versionen överst i `CHANGELOG.md` och sedan tagga:

```bash
git tag v1.2.0 && git push origin v1.2.0
```

GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)) validerar skillen, bygger `skill.zip`, räknar SHA-256, skapar `SHA256SUMS` och lägger båda på en GitHub Release med texten ur `CHANGELOG.md`. Taggen måste vara samma som versionen i `SKILL.md`, annars stannar flödet. Länken `…/releases/latest/download/skill.zip` pekar alltid på senaste releasen, så ingen länk behöver ändras.

## Licens

Skillens text och skript är under [MIT-licensen](LICENSE). Namnet Promptbanken och Promptbankens logotyp (`assets/promptbanken-*.png`) ingår inte i licensen och får inte användas för att antyda att en ändrad version kommer från Promptbanken.
