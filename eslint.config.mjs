import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["vendor/**", "public/**", ".next/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // D6: data bez jawnej strefy to nie jest błąd stylu — na Vercelu (proces w
    // UTC) wieczorny trening lądował na liście dzień wcześniej niż w kalendarzu
    // nad nią. Trafiło to trzy ekrany naraz, mimo że `lib/dateTime.ts` istnieje
    // dokładnie po to i tłumaczy to w komentarzu. Reguła jest tu, a nie w
    // teście, bo test asertujący regex na źródle to osobny dług (audyt §D16).
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    ignores: ["lib/dateTime.ts", "lib/week.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // Tylko metody jednoznacznie datowe. Samo `toLocaleString` zostaje
          // dozwolone, bo w tym repo dziewięć jego wywołań to separator tysięcy
          // na liczbach (tonaż, delty) — reguła łapiąca i to byłaby szumem,
          // który ludzie wyłączają komentarzem zamiast czytać.
          selector:
            "CallExpression[callee.property.name=/^toLocale(Date|Time)String$/]",
          message:
            "Formatuj daty przez `formatWarsawDate`/`formatWarsawDateTime` z lib/dateTime — `toLocaleDateString` bierze strefę procesu (UTC na Vercelu).",
        },
        {
          // …plus wariant datowy `toLocaleString`, rozpoznany po `new Date(…)`.
          selector:
            "CallExpression[callee.object.callee.name='Date'][callee.property.name='toLocaleString']",
          message:
            "Formatuj daty przez `formatWarsawDateTime` z lib/dateTime — `new Date(…).toLocaleString()` bierze strefę procesu (UTC na Vercelu).",
        },
      ],
    },
  },
];

export default eslintConfig;
