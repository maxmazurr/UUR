# Lapis UI/UX Design Guidelines

Tento dokument slouží jako hlavní manuál pro udržení vizuální konzistence a stejné atmosféry napříč všemi dashboardy (Dashboard 1 a Dashboard 2) a budoucími stránkami aplikace Lapis.

## 1. Základní barevná paleta (Colors)
Aplikace využívá tmavý, vesmírně-neónový ("Dark Neumorphic/Glassmorphic") styl s výraznými barevnými akcenty.

*   **Pozadí aplikace (Primary BG):** `#0F1117` (hladká, temná noční obloha).
*   **Karty a panely (Secondary BG):** `#161b27` nebo `rgba(255, 255, 255, 0.03)` + backdrop-filter.
*   **Hlavní text:** `#F0F2F8` (téměř čistě bílá).
*   **Sekundární text:** `#8891AA` (slabá šedomodrá).
*   **Akcentové barvy (Orbs & Gradients):**
    *   Lapis Purple: `#9055FF` `rgb(144, 85, 255)`
    *   Lapis Teal/Cyan: `#13E2DA` `rgb(19, 226, 218)`
    *   Lapis Green: `#4ADE80` (úspěchy, progres, splněné úkoly)
    *   Lapis Orange: `#FB923C` (série/streak, upozornění)

## 2. Typografie (Fonts)
Pro udržení prémiového vzhledu používáme kombinaci 3 fontů:
1.  **Nadpisy (Headings):** `Cabinet Grotesk` (Váhy 500, 700, 800) – dodává aplikaci moderní, mírně "brutalistní" a sebevědomý look.
2.  **Běžný text (Body):** `DM Sans` nebo `Inter` (Váhy 400, 500) – pro maximální čitelnost malého textu a UI prvků.
3.  **Kód a zkratky (Mono):** `JetBrains Mono` – pro zobrazení klávesových zkratek (např. `⌘K`).

## 3. Styl komponent (Glassmorphism & Borders)
Každá "vyvýšená" komponenta na obrazovce by měla následovat tento vzhled:
*   **Pozadí:** `background: rgba(255, 255, 255, 0.03)` nebo částečně průhledná barva z palety.
*   **Borders (Okraje):** `border: 1px solid rgba(255, 255, 255, 0.08)` – ultra jemné světlé ohraničení, které definuje tvar.
*   **Rozostření (Blur):** `backdrop-filter: blur(16px)` nebo `24px` – kritické pro to, aby přes komponentu problikával barevný svítící vizuál z pozadí.
*   **Rádius zaoblení:** `rounded-xl` (12px), `rounded-2xl` (16px) nebo `rounded-[24px]` u velkých karet.

## 4. Animace a interakce (Motion)
Stránka nesmí působit staticky, ale zároveň by animace neměly překážet:
*   **Hover na kartách:** Plynulý zdvih `transform: translateY(-4px)`, jemné škálování `scale(1.02)` a zvětšení stínu a ztmavení okraje pro vyniknutí z pozadí.
*   **Načítání (FadeUp):** Všechny prvky by měly naskakovat s jemným pohybem zespodu a zprůhledněním `opacity: 0 -> 1` a `translateY(-10px) -> 0`.
*   **Tlačítka (Magnetic):** Výrazná CTA tlačítka by měla jemně "lepit" k myši, čímž vzniká pocit fyzické odezvy. Využij animované okraje u sekundárních tlačítek skrze CSS vlastnost `mask`.

## 5. Pozadí (Background & Parallax)
Oba dashboardy sdílí "živé" pozadí, kde se na sítnici oka objevují obrovské barevné sféry (`Orbs/Blobs`), které jemně rotují a pohybují se.
*   Při **skrollování stránky** by na tyto orbity měl reagovat pohyb myši (obláčky běží plynule naopak / scroll-parallax efekt).
*   Postupným skrollem dolů by se měla **měnit i paleta** (např. z Fialovo/Tyrkysové do Oranžovo/Zelené), jako metafora pro plynoucí čas učení.

### Checklist před přidáním nové komponenty:
- [ ] Využívá pozadí s malou opacitou a `backdrop-filter: blur()`?
- [ ] Zářivé detaily jsou tvořeny přes Glow (Text / Box stíny) a ne skrz přehnanou plnou barvu?
- [ ] Skrývá scrollbary tam, kde to jde (kompaktní horizontální listy)?
- [ ] Má přirozené a velkorysé vnitřní odsazení (`padding`), aby text mohl dýchat?
- [ ] Jsou klávesnice/UI elementy plně ošetřené pro interakce prstem na menším zařízení?
