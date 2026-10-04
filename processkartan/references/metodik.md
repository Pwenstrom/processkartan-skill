# Metodik: från rått underlag till en karta du kan stå för

Det här är skillens egen arbetsmetod. Den fungerar alltid, med eller utan Promptbankens verktyg. Formatet och reglerna finns i `format.md` och råd om hur kartan blir tydlig i `modellering.md`.

## Fem principer

1. **Skilj på nuläge och önskat läge.** Underlaget blandar ofta hur det fungerar i dag ("vi skickar mejl") med hur det borde fungera ("det borde gå via systemet"). Rita nuläget som huvudflöde om inte användaren ber om något annat. Är det önskade läget det som efterfrågas: rita det, och säg det bland antagandena. Blanda aldrig de två i samma karta utan att säga det.
2. **Hitta inte på ansvar.** En roll finns på kartan bara om underlaget nämner den. Säger underlaget inte vem som gör ett steg: `roleId: null`. Det är ett riktigt och användbart svar, eftersom Snabbkontroll då visar var ansvaret saknas.
3. **Markera det som är osäkert.** Skilj på det som sägs tydligt, det som du tolkat och det som saknas. Tolkningar och luckor hör hemma i antagandena i slutsvaret (högst fem punkter), inte som påhittade steg i kartan.
4. **Kontrollera varje beslutspunkt.** Ett beslut ska ha en fråga, exakt två utfall och ett mål för båda. Frågar underlaget "vad händer om nej?" utan att svara: ställ frågan till användaren (högst tre frågor) eller notera luckan i antagandena. Gissa inte vad som händer vid nej.
5. **Hitta slut och slingor.** Varje väg ska sluta någonstans, och en slinga ska vara en verklig upprepning ("komplettera och försök igen"), inte en omväg som bara låter rimlig.

## Arbetsgång för rått underlag

Gäller mötesanteckningar, transkriberingar, långa mejltrådar och motsägelsefulla beskrivningar.

1. **Läs hela underlaget först**, och skriv sedan ner för dig själv: vad startar processen, vilka funktioner gör något, vilka frågor leder till olika vägar och hur kan det sluta.
2. **Sortera uppgifterna i tre högar:** sägs tydligt, tolkat av dig, saknas.
3. **Motsäger underlaget sig självt**, till exempel två personer som beskriver olika ordning: välj den version som flest delar stödjer, eller den som användaren sa är den gällande, och redovisa valet i antagandena. Rita aldrig båda i samma karta.
4. **Gör huvudflödet först.** Lägg undantag och avvikelser efter det (se "Listordningen styr kartan" i `modellering.md`).
5. **Gå igenom beslutspunkterna** enligt princip 4.
6. **Skriv filen och kontrollera den** enligt SKILL.md.

## Vad som hör till kartan och vad som inte gör det

- Hör till kartan: steg, roller, beslut, slingor, slut.
- Hör inte till kartan, men nämns i slutsvaret om det är viktigt: systemnamn, mallar, regler, tidsgränser, problem och förbättringsförslag. Processkartan har ingen anteckningsruta på ett steg ännu.
