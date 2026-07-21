# Arco — dostępy i role

**Utworzono:** 2026-07-21 · Właściciel infrastruktury: Daniel (Founder).

Jak nadawać Piotrowi (i przyszłym współpracownikom) dostęp do usług Arco — bezpiecznie
i zgodnie z porozumieniem §3. Ten plik jest instrukcją „krok po kroku", bo część z tego
robi się pierwszy raz.

## Zasady (twarde, z porozumienia §3)

1. **Każdy ma własny login.** Nigdy nie współdzielimy jednego konta ani hasła.
2. **2FA włączone wszędzie**, gdzie usługa to oferuje (GitHub, Supabase, Vercel, Google, Apple).
3. **Least privilege** — dajemy najniższą rolę wystarczającą do zadania. Owner/właściciel = tylko Daniel.
4. **Nie przekazujemy haseł ani kart** wiadomością/mailem/Slackiem. Zapraszamy przez e-mail
   w panelu usługi — druga osoba loguje się swoim kontem.
5. **`service_role` / hasło do bazy nie krąży w plaintekście.** Piotr generuje/pobiera własne
   klucze w panelu Supabase; sekrety produkcyjne żyją tylko w env serwerowym, nigdy w repo/logach.
6. **Dostęp = do uzgodnionych zadań**, nie własność Projektu. Rośnie wraz z zakresem, który
   Piotr faktycznie przejmuje.

## Matryca

| Usługa | Rola Piotra | Kiedy | Status |
|---|---|---|---|
| **GitHub** (repo `danielm1212/arco`) | Collaborator **Write** (docelowo: członek organizacji) | **teraz** — bez tego nie kodzi | OPS-08 |
| **Linear** (`trainarco`) | **Member** | **teraz** | OPS-09 |
| **Supabase** (projekt prod) | **Developer** (nie Owner) | gdy wejdzie w backend/prod (po SEC-01 na lokalnym stacku) | OPS-10 |
| **Vercel** (projekt Arco) | **Member** | gdy przejmie deploye/monitoring | OPS-11 |
| Namecheap (domena) | — zarządza Daniel | w razie potrzeby, ad hoc | — |
| App Store / Google Play | rola w zespole deweloperskim | po H2 (STORE-00) | later |

SEC-01 (pierwsze zadanie) **nie wymaga dostępu do proda** — robi się w 100% na lokalnym stacku
Supabase. Więc realnie „na teraz" potrzebne są tylko **GitHub + Linear**.

## Jak nadać dostęp — krok po kroku

### GitHub (teraz — OPS-08)
Piotr potrzebuje **własnego konta GitHub**; podaje Ci swój login.
1. Repo → **Settings → Collaborators and teams → Add people** → wpisz jego login → rola **Write**.
2. Piotr przyjmuje zaproszenie (mail/GitHub) i dodaje **swój** klucz SSH (GitHub → Settings → SSH keys),
   żeby móc `git clone git@github.com:danielm1212/arco.git`.
3. Włącz sobie i poproś Piotra o **2FA** na GitHubie.
> Opcja docelowa (gdy dojdą kolejne osoby): założyć darmową **organizację GitHub `trainarco`**
> i przenieść repo — czystsze uprawnienia i własność zespołowa. Zmienia URL repo (i integrację
> Vercel), więc to osobne, świadome zadanie — nie teraz.

### Linear (teraz — OPS-09)
1. Linear → **Settings → Members → Invite** → e-mail Piotra → rola **Member**.
2. Po dołączeniu przypisz mu **SEC-01 (DAN-34)** (Assignee).

### Supabase (gdy wejdzie w backend — OPS-10)
1. Projekt → **Settings → Team → Invite** → e-mail Piotra → rola **Developer** (NIE Owner/Admin).
2. Piotr włącza 2FA; klucze API/DB pobiera **sam** w panelu — nie wysyłasz ich wiadomością.
3. Do zadań ruszających schemat obowiązują reguły `.claude/skills/arco-migration` (migracje przez `supabase/migrations`, RLS + test wielokontowy).

### Vercel (gdy przejmie deploye — OPS-11)
1. Vercel → **Team/Project → Settings → Members → Invite** → e-mail Piotra → rola **Member**.
2. Deploy nadal idzie procedurą `.claude/skills/arco-release`.

## Off-boarding (porozumienie §7.3)

Gdyby współpraca się kończyła: odbierz dostępy we wszystkich panelach (usuń z Collaborators/
Members/Team), Piotr przekazuje stan prac i **usuwa lokalne kopie danych użytkowników**.
Poufność i prawa do przekazanych Rezultatów zostają w mocy.
