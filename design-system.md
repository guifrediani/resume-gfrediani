# Design System — Currículo (estilo Riot Games)

> Extraído da análise do `index.css` e do HTML da home de riotgames.com (pt-BR), adaptado para um site pessoal de currículo. Todos os valores de cor, tipografia, espaçamento, raio e motion abaixo vêm do CSS real do site; as seções "Adaptação para currículo" são recomendações minhas.

---

## 1. Princípios visuais

1. **Dark-first.** Fundo quase preto, texto off-white. O branco puro raramente aparece; o "branco" do sistema é `#E7E6E3`.
2. **Um único acento.** O vermelho `#D1363A` é o único acento de marca. Ele aparece em CTAs, links em hover e detalhes — nunca em grandes áreas.
3. **Tipografia pesada e apertada.** Títulos em peso 800–900, `letter-spacing: -0.03em`, `line-height` próximo de 1 (0.83–1.1). O texto corrido é leve e generoso (`line-height: 1.5–1.67`).
4. **Imagem manda.** Cards são imagens de borda a borda com conteúdo sobreposto; quase nada de borda visível, pouquíssima sombra.
5. **Cortes diagonais.** Recortes com `clip-path` em polígonos (5–10% de inclinação) em imagens de seção e cards secundários. É a assinatura geométrica do site.
6. **Motion contida e uniforme.** Uma única curva de easing (`cubic-bezier(.215,.61,.355,1)`), transições de 0.2–0.3s, animações de entrada do tipo "reveal-up".
7. **Eyebrows em caixa alta.** Rótulos pequenos (10–12px), bold, uppercase, acima de títulos — o site usa para categorias ("NOTÍCIAS", "ESPORTS").

---

## 2. Tokens de cor

### 2.1 Neutros (base do sistema)

| Token | Hex | Uso no site |
|---|---|---|
| `--color-bg` | `#252423` | Fundo do `body`, header, footer |
| `--color-bg-deep` | `#1F1F1F` | Fundo do `.container` de seções |
| `--color-bg-black` | `#0A0A0A` | Botão escuro do hero, hover de botão light |
| `--color-surface` | `#2B2A29` | Superfícies elevadas, hover de botão secundário |
| `--color-surface-alt` | `#403F3E` | Botão inverso desabilitado / superfícies terciárias |
| `--color-border` | `#656462` | Bordas, texto muted em fundo claro |
| `--color-text-muted` | `#8A8887` | Texto secundário em fundo escuro |
| `--color-text-subtle` | `#ADACAA` | Texto terciário |
| `--color-border-light` | `#C5C5C3` | Bordas em superfícies claras |
| `--color-divider` | `#D3D1CF` | Eyebrow padrão, divisores suaves |
| `--color-surface-light` | `#DBD9D6` | Hover de itens em lista (tema claro) |
| `--color-text` | `#E7E6E3` | **Cor de texto padrão** ("branco" da Riot) |
| `--color-white` | `#F9F9F9` | Texto sobre botão primário |

### 2.2 Acento (marca)

| Token | Hex | Uso |
|---|---|---|
| `--color-accent` | `#D1363A` | CTAs primários, links, underline em hover |
| `--color-accent-hover` | `#DA5E61` | Hover do botão primário |
| `--color-accent-active` | `#D64A4E` | Active do botão primário |
| `--color-accent-dark` | `#A32629` | Início do gradiente vermelho |
| `--color-accent-bright` | `#D53235` | Fim do gradiente vermelho |

Gradiente de hover para botões de destaque:
`linear-gradient(135deg, #A32629 0%, #D53235 50%, #D53235 100%)`

### 2.3 Cores auxiliares (uso raro)

| Hex | Onde aparece |
|---|---|
| `#A38E40` | Dourado — foco/outline (`box-shadow: 0 0 0 2px`) e placeholder de imagem |
| `#00EFB4` | Verde-menta — foco alternativo |
| `#0BC4E2` → `#2C8CC2` | Azul-ciano — gradiente temático (Wild Rift) |
| `#94A3CD`, `#4D65AC` | Azul lavanda — categoria/CTA de seção de carreiras |

### 2.4 Overlays

```css
--overlay-pill:     rgba(138,136,135,.2);   /* fundo de pills/tags de plataforma */
--overlay-pill-hi:  rgba(138,136,135,.5);   /* "em breve" */
--overlay-card:     rgba(173,172,170,.2);   /* contadores/estatísticas */
--shadow-card:      0 4px 16px rgba(10,10,10,.2);
--text-shadow-hero: 0 0 2px rgba(43,42,41,.8);
```

### 2.5 Adaptação para currículo

- Use `--color-bg` no `body`, `--color-bg-deep` em seções alternadas para criar ritmo sem bordas.
- Reserve o vermelho para: botão "Baixar CV", link do e-mail/LinkedIn em hover, marcador da experiência atual na timeline.
- Dourado `#A38E40` pode marcar certificações (PMP, CSPO) — é a cor de "destaque premium" do sistema.

---

## 3. Tipografia

### 3.1 Famílias

| Papel | Fonte original (Riot) | Substituto livre recomendado |
|---|---|---|
| Display / títulos | **Riot Sans Latin** (proprietária, pesos 400/700) | **Inter Tight** (Google Fonts) em 800–900, ou **Archivo** 800 |
| Corpo / UI | **Inter V Latin** (Inter variável, 300–900) | **Inter** (Google Fonts, variável) |
| Acento condensado | **Oswald** (usada em CTAs e contadores de "Carreiras") | **Oswald** (Google Fonts) |

Fallback sempre: `Arial, sans-serif`.

```css
--font-display: 'Inter Tight', 'Riot Sans Latin', Arial, sans-serif;
--font-body:    'Inter', 'Inter V Latin', Arial, sans-serif;
--font-condensed: 'Oswald', Arial, sans-serif;
```

### 3.2 Base

```css
html { font-size: 16px; line-height: 1.5; color: #E7E6E3; font-weight: 400; }
body { font-family: var(--font-body); letter-spacing: -0.03em;
       -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
h1,h2,h3,h4,h5,h6 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.03em; }
```

O `letter-spacing: -0.03em` é global — aplica-se a títulos, corpo, botões e eyebrows.

### 3.3 Escala de títulos (mobile → tablet ≥550 → desktop ≥960 → wide ≥1280/1440)

| Classe | Peso | Mobile | ≥550px | ≥960px | ≥1280px+ | line-height |
|---|---|---|---|---|---|---|
| `.heading--1xl` | 900 | 3.75rem (60px) | 7.5rem | 10rem | 11.25 → 13.75rem | 0.83–0.94 |
| `.heading--2xl` | 900 | 3.125rem (50px) | 6.25rem | 7.5rem | 8.75rem | 0.83–0.92 |
| `.heading--1` | 900 | 3.375rem (54px) | 5rem | 6rem | — | 1.0 |
| `.heading--2` | 800 | 2.25rem (36px) | 3.75rem | 5rem | — | 1.07–1.11 |
| `.heading--3` | 800 | 1.875rem (30px) | 2.75rem | 3.125rem | 4rem | 1.13–1.16 |
| `.heading--4` | 800 | 1.25rem (20px) | 2.25rem | 2.75rem | — | 1.23–1.4 |
| `.heading--5` | 700–800 | 1.125rem (18px) | 1.625rem | 1.75rem | — | 1.23–1.36 |
| `.heading--6` | 600–700 | 1rem (16px) | 1.125rem | 1.25rem | — | 1.33–1.4 |

Modificador: `.heading--uppercase { text-transform: uppercase; }`

### 3.4 Corpo de texto

| Classe | Tamanho | line-height | Cor |
|---|---|---|---|
| `.copy` | 1rem (16px) | 1.5 | `#E7E6E3` (dark) / `#2B2A29` (light) |
| `.copy--large` | 1.125rem → 1.3–1.375rem (desktop) | 1.64–1.67 | idem |
| `.copy--small` | 0.75rem → 0.875rem | 1.5–1.57 | idem |
| `.copy--muted` | herda | herda | `#8A8887` (dark) / `#656462` (light) |

Largura máxima de parágrafo: **440–467px** (`.copy { max-width: 440px }`, `.content-center--4-12 { max-width: 466.667px }`).

### 3.5 Eyebrow (rótulo de categoria)

```css
.eyebrow {
  font-family: var(--font-body);
  font-size: .625rem;           /* 10px; .688rem (11px) em ≥960 */
  line-height: 1.6;
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: #D3D1CF;               /* --light: #E7E6E3 | --muted: #8A8887 */
  display: inline-block;
  padding: 3px 10px 2px;        /* .eyebrow--xl: 5px 20px, 12–14px */
}
```

Variante de categoria (usada nos cards de notícia): `font-size: .75rem; font-weight: 800; uppercase; color: rgba(101,100,98,.9)`.

### 3.6 Adaptação para currículo

- **Nome** no hero: `.heading--1xl` ou `.heading--2xl`, peso 900, uppercase, line-height 0.9.
- **Cargo/tagline**: `.copy--large` com `--color-text-muted`.
- **Títulos de seção** ("Experiência", "Projetos"): `.heading--2` em 800.
- **Cargo dentro da timeline**: `.heading--4`; empresa e período: eyebrow.
- **Bullets de resultado**: `.copy`, máximo 467px de largura.

---

## 4. Layout e grid

### 4.1 Breakpoints

```css
--bp-sm:   550px;   /* tablet portrait — 264 regras */
--bp-md:   800px;
--bp-lg:   960px;   /* desktop — ponto principal, 352 regras */
--bp-xl:   1280px;
--bp-2xl:  1440px;
--bp-3xl:  1600px;
--bp-4xl:  1920px;
```

Abordagem **mobile-first** (`min-width`). O ponto de virada mobile/desktop é **960px**.

### 4.2 Containers

| Classe | max-width | Uso |
|---|---|---|
| `.content-center` | 1440px (1800px em telas muito largas) | Container padrão |
| `.content-center--10-12` | 1196.667px | Conteúdo largo |
| `.content-center--8-12` | 953.333px | Texto + mídia |
| `.content-center--6-12` | 710px | Blocos de texto |
| `.content-center--4-12` | 466.667px | Parágrafos / colunas estreitas |
| `.content-center--large` | 1890px | Carrossel de jogos |

Grid implícito de **12 colunas** — os nomes `8-12`, `6-12`, `4-12` derivam de 1440 × (n/12) com gutter.

### 4.3 Gutters laterais

```css
.content-gutter        { padding: 0 20px; }           /* mobile */
@media (min-width:550px)  { .content-gutter--tablet, .content-gutter--large { padding: 0 40px; } }
@media (min-width:960px)  { .content-gutter--large { padding: 0 80px; } }
```

### 4.4 Espaçamento vertical

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  30px;   /* margens de header de seção, .copy margin-top */
--space-10: 40px;
--space-12: 50px;   /* row-gap do .container (mobile) */
--space-15: 60px;   /* .content-showcase__header margin-bottom (desktop) */
--space-20: 80px;   /* padding vertical de seção (careers) */
--space-25: 100px;  /* row-gap do .container (desktop = 6.25rem) */
```

Regra do site: seções empilhadas em `flex-direction: column` com `row-gap: 50px` (mobile) → `100px` (desktop). Sem margens entre seções — o gap faz o trabalho.

### 4.5 Anatomia da home (referência para o currículo)

```
[Header transparente fixo, 70px]
[Hero full-bleed — imagem/vídeo + conteúdo à esquerda, max-width 560–800px]
[Novidades — lista de cards horizontais (imagem à direita, título à esquerda)]
[Nossos jogos — carrossel Embla de cards 900×536 com logo centralizado + pills de plataforma]
[Esports e Entretenimento — carrossel de cards 25% com clip-path diagonal]
[Estamos contratando — 2 colunas: texto centralizado (max 620px) + imagem com clip-path]
[Footer — 60px 20px 40px, links em 11px uppercase, redes sociais, "Voltar ao topo"]
```

Mapeamento sugerido para currículo:

| Seção Riot | Seção do currículo |
|---|---|
| Hero | Nome + cargo + CTA "Baixar CV" / "LinkedIn" |
| Novidades | Destaques recentes (certificação, promoção, projeto lançado) |
| Nossos jogos | Projetos / produtos que você liderou (cards grandes com imagem) |
| Esports e Entretenimento | Habilidades / ferramentas (cards menores com clip-path) |
| Estamos contratando | Contato — texto centralizado + estatísticas (anos de experiência, times, certificações) + CTA |
| Footer | Links sociais, e-mail, "Voltar ao topo" |

---

## 5. Forma, raio, borda, sombra

### 5.1 Raios

```css
--radius-sm:    4px;
--radius-md:    8px;     /* cards, imagens de artigo, contadores */
--radius-lg:    12px;
--radius-xl:    24px;
--radius-pill:  32px;    /* botões .button */
--radius-tag:   16–20px; /* pills de plataforma */
--radius-full:  50%;     /* avatares, botões circulares */
```

### 5.2 Sombras

O site usa **quase nenhuma sombra**. As únicas relevantes:

```css
--shadow-card:  0 4px 16px rgba(10,10,10,.2);   /* .game-card */
--shadow-soft:  0 4px 4px rgba(10,10,10,.15);
--focus-ring:   0 0 0 2px #A38E40;              /* foco de teclado (dourado) */
```

### 5.3 Clip-paths (assinatura geométrica)

```css
/* Card secundário — paralelogramo */
--clip-parallelogram: polygon(0 0, 95% 0, 100% 100%, 5% 100%);

/* Imagem de seção — corte no canto superior esquerdo */
--clip-corner: polygon(10% 0, 100% 0, 100% 100%, 0 100%);

/* Slide de carrossel — inclinação leve nas bordas horizontais */
--clip-slant-sm: polygon(0 0, 100% 5px,  100% 100%, 0 calc(100% - 5px));
--clip-slant-md: polygon(0 0, 100% 15px, 100% 100%, 0 calc(100% - 10px));
--clip-slant-lg: polygon(0 0, 100% 25px, 100% 100%, 0 calc(100% - 20px));
```

### 5.4 Bordas

Bordas são raras e finas: `1px solid #2B2A29` (dark), `1px solid #C5C5C3` (light), `1px solid #656462` (hover). Divisores de footer: `1px solid grey` entre colunas.

---

## 6. Motion

### 6.1 Easing e duração

```css
--ease-out-cubic: cubic-bezier(.215,.61,.355,1);   /* padrão — 246 ocorrências */
--ease-in-out-quint: cubic-bezier(.86,0,.07,1);    /* transições dramáticas / menus */
--ease-out-expo: cubic-bezier(.23,1,.32,1);

--duration-fast: .1s;    /* opacidade, background de header */
--duration-base: .2s;    /* hover de cards */
--duration-slow: .3s;    /* botões, filtros, cores — o mais comum */
--duration-reveal: 1s;   /* animações de entrada */
```

Padrão de transição: `transition: all .3s ease-out;` (36 ocorrências). Para botões: `transition-property: color, background-color, background-position; transition-duration: .3s`.

### 6.2 Animações de entrada (hero)

```css
@keyframes reveal-up   { from { transform: translateY(100px);  opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes reveal-down { from { transform: translateY(-100px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes mask-reveal-from-right {
  from { clip-path: polygon(99.999% 0, 100% 0, 100% 100%, 99.999% 100%); opacity: 0; }
  to   { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 1; }
}
```

Sequência escalonada no hero (delays): eyebrow `.4s` → título `.8s` → copy `1.2–1.6s`. Duração `1s`, easing `--ease-out-cubic`, `forwards`.

### 6.3 Hovers característicos

- **Botão "wipe"**: fundo com `background-image: linear-gradient(-183deg, corA 49.5%, corB 50.5%)`, `background-size: 100% 255%`, `background-position: 50% 0` → em hover `background-position: 0 0` (o gradiente "sobe" e troca a cor).
- **Card de imagem**: `transform: scale(1.05)` + `opacity: .4` no `__image-inner` e conteúdo aparece.
- **Imagem grayscale**: `filter: grayscale(1)` no repouso → `filter: none` em hover (`transition: filter .3s ease-out`). Usado nas thumbs de notícia.
- **Link de texto**: `border-bottom-color` do `<span>` interno muda para `#D1363A`.

---

## 7. Componentes

### 7.1 Header / Navegação

```css
.header { position: fixed; top: 0; width: 100%; height: 70px;   /* 50px mobile */
          background: transparent; border-bottom: 0;
          transition: background-color .1s ease-in-out; }
.header--scrolled { background-color: #252423; }
html { scroll-behavior: smooth; scroll-padding-top: 90px; }
```

- Logo à esquerda, links centralizados (`flex-grow: 1.5; text-align: center`), CTA à direita (`width: 30%; text-align: right`).
- Menu mobile: painel `position: fixed` full-screen, `background-color: #252423` com textura escura repetida, `transition: height .3s ease-out`.
- Item de nav: `padding-left: 30–40px`, `display: inline-flex; flex-direction: column; align-items: center`.

### 7.2 Botões

**`.button` (pill, base)**
```css
.button {
  display: inline-block; position: relative; cursor: pointer; border: 0;
  padding: 10px 30px; min-width: 160px; border-radius: 32px;
  font-family: var(--font-body); font-size: 12px; line-height: 20px; letter-spacing: -0.03em;
  color: #E7E6E3; text-align: center; text-decoration: none;
  background-color: #D1363A;
  background-image: linear-gradient(-183deg, #D1363A 49.5%, #2B2A29 50.5%);
  background-size: 100% 255%; background-position: 50% 0; background-repeat: no-repeat;
  transition: color .3s ease-out, background-color .3s ease-out, background-position .3s ease-out;
}
.button:hover { background-position: 0 0; }
@media (min-width: 960px) { .button { font-size: 14px; line-height: 22px; padding: 12px 30px; min-width: 180px; } }
```

| Variante | Diferença |
|---|---|
| `.button--secondary` | fundo transparente, `border: 1px solid #2B2A29`, `color: #D1363A`, `padding: 9px 29px`; hover → fundo `#2B2A29` |
| `.button--inverse` | fundo `#E7E6E3`, texto `#2B2A29`; hover → wipe para `#D1363A` |
| `.button--muted` | transparente, `border: 1px solid #C5C5C3`, texto `#2B2A29` |
| `.button--text` | sem fundo, sem padding, `color: #D1363A`; hover sublinha o `<span>` |
| `.button--xl` | `padding: 14–15px 30px; max-width: 280px` |
| `.button--block` | `display: block; width: 100%` |

**`.button-standard` (retangular, usado no hero e "Carreiras")**
```css
.button-standard--primary { background-color: #D1363A; color: #F9F9F9; }
.button-standard--primary:hover  { background-color: #DA5E61; }
.button-standard--primary:active { background-color: #D64A4E; }
.button-standard--large  { font-size: 20px; line-height: 20px; font-weight: 700; padding: 22px 16px; min-width: 220–260px; }
.button-standard--small  { font-size: .813rem; font-weight: 800; text-transform: uppercase; line-height: 1;
                           padding: .5rem .75rem; border-radius: 6.5px; }
.button-standard--black  { background-color: rgba(128,128,128,.2); color: #F9F9F9; }
```

Variante condensada (Carreiras): `font-family: Oswald; text-transform: uppercase; letter-spacing: .04em; border-radius: 0`.

### 7.3 Pill / Tag

```css
.tag {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 2px 4px; border-radius: 16px;
  background-color: rgba(138,136,135,.2);
  font-size: .875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05rem; color: #fff;
}
.tag--prominent { padding: .25rem 1rem; border-radius: 20px; background-color: rgba(138,136,135,.5); }
```
Uso: plataformas dos jogos → **skills/ferramentas** no currículo (Jira, Notion, Figma, Spec Kit…).

### 7.4 Card grande com imagem (`.game-card` / showcase)

```css
.card-showcase {
  position: relative; border-radius: 8px; overflow: hidden;
  box-shadow: 0 4px 16px rgba(10,10,10,.2);
  aspect-ratio: 900 / 536;              /* ≈ 16:9.5 */
  transition: all .2s ease-out;
}
.card-showcase__img  { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.card-showcase__body { position: absolute; inset: 0; display: flex; flex-direction: column;
                       justify-content: space-between; align-items: center; text-align: center;
                       padding: 24px 32px; pointer-events: none; }
.card-showcase__logo { max-width: 160–180px; margin: auto; }
```
Largura em carrossel: `calc(33.33vw - 66.6px)` em ≥1280, `calc(50vw - 60px)` em ≥960, `564px` em ≥1890.

### 7.5 Card horizontal de notícia (`.whats-happening__article-card`)

```css
.card-row {
  display: flex; justify-content: space-between; align-items: center;
  position: relative; min-height: 85px; height: 100%; border-radius: 8px;
}
.card-row__text  { width: 50–60%; padding: .5rem 1rem; display: flex; flex-direction: column; row-gap: 16px; }
.card-row__image { position: absolute; right: 0; top: 0; height: 100%; aspect-ratio: 243/138;
                   background-size: cover; border-radius: 8px;
                   filter: grayscale(1); transition: filter .3s ease-out; }
.card-row:hover .card-row__image { filter: none; }
.card-row__category { font-size: .75rem; font-weight: 800; text-transform: uppercase; color: rgba(101,100,98,.9); }
```
Uso: **timeline de experiência** — logo/foto da empresa à direita em grayscale, cargo à esquerda.

### 7.6 Card cover com overlay (`.card-cover-alt`)

- Proporção 16:9 (`padding-bottom: 56.25%`), `background-color: #E7E6E3` como placeholder.
- Conteúdo em `position: absolute; bottom: 0; padding: 20px` (40px desktop), cor `#E7E6E3`.
- Hover: imagem `scale(1.05)` + `opacity: .4`, título e ações aparecem (`opacity: 0 → 1`).
- Ícone de tipo no canto: `top: 10px; left: 10px`.

### 7.7 Cabeçalho de seção

```css
.section__header { display: flex; align-items: center; justify-content: space-between;
                   margin-bottom: 30px; /* 60px (3.75rem) em ≥960 */ }
.section__header h2 { /* .heading--2 */ }
.section__header .see-all { /* .button--text: "Ver tudo" */ }
```
Padrão: título à esquerda, link "Ver tudo →" à direita; setas de carrossel (`2.5rem × 2.5rem`, separador `1px × 40px` branco) alinhadas ao header.

### 7.8 Bloco de estatísticas (`.careers__jobs__count`)

```css
.stat { flex: 1 1 260px; padding: 16px; /* 20px desktop */ text-align: center;
        background-color: rgba(173,172,170,.2); border-radius: 8px;
        font-size: 1.125rem; /* 1.5rem desktop */ line-height: 1.2; font-weight: 700; color: #656462; }
.stat span { display: block; /* número grande */ }
```
Uso: "8+ anos", "5 startups aceleradas", "2 certificações", etc. Container: `display: flex; margin-bottom: 40px`.

### 7.9 Seção "duas colunas com imagem cortada" (`.careers`)

```css
.split { display: flex; }
.split__content { flex: 1 1 50%; display: flex; align-items: center; }
.split__content-inner { max-width: 620px; margin: 0 auto; text-align: center; padding: 80px 16px 0; }
.split__image { flex: 1 1 55%; clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%); }
@media (max-width: 959px) { .split__image { filter: grayscale(1); clip-path: unset; flex: 1 1 45%; } }
```

### 7.10 Footer

```css
.footer__inner { position: relative; z-index: 1; background-color: #252423;
                 padding: 60px 20px 40px; color: #fff; font-size: .688rem; text-align: center; }
.footer__row   { display: flex; align-items: center; justify-content: space-between;
                 padding: 30px 0; max-width: 1440px; margin: 0 auto; }
.footer__navigation a { text-transform: uppercase; }
.footer__col--secondary:not(:last-child) { border-right: 1px solid grey; }
```
Estrutura: linha 1 = logo + links legais uppercase + ícones sociais; separador; linha 2 = copyright + "Voltar ao topo".

### 7.11 Foco e acessibilidade

- `a11y-navigation` com "Jump to Main Content" antes do header.
- Foco visível em dourado: `box-shadow: 0 0 0 2px #A38E40` (ou `#00EFB4`).
- `scroll-padding-top: 90px` para links-âncora não ficarem sob o header fixo.
- Imagens decorativas com `alt=""`.

---

## 8. Tema claro (opcional)

O site tem um tema claro completo. Se quiser um toggle:

| Token | Dark | Light |
|---|---|---|
| bg | `#252423` | `#F9F9F9` / `#E7E6E3` |
| text | `#E7E6E3` | `#2B2A29` |
| muted | `#8A8887` | `#656462` |
| border | `#2B2A29` | `#C5C5C3` |
| hover surface | `#2B2A29` | `#DBD9D6` |
| accent | `#D1363A` | `#D1363A` |

---

## 9. Folha de tokens pronta (`:root`)

```css
:root {
  /* Cor */
  --color-bg: #252423;        --color-bg-deep: #1F1F1F;     --color-bg-black: #0A0A0A;
  --color-surface: #2B2A29;   --color-surface-alt: #403F3E;
  --color-border: #656462;    --color-border-light: #C5C5C3;
  --color-text: #E7E6E3;      --color-text-muted: #8A8887;  --color-text-subtle: #ADACAA;
  --color-white: #F9F9F9;     --color-divider: #D3D1CF;
  --color-accent: #D1363A;    --color-accent-hover: #DA5E61; --color-accent-active: #D64A4E;
  --color-accent-dark: #A32629; --color-accent-bright: #D53235;
  --color-gold: #A38E40;      --color-mint: #00EFB4;
  --overlay-pill: rgba(138,136,135,.2); --overlay-card: rgba(173,172,170,.2);

  /* Tipografia */
  --font-display: 'Inter Tight', 'Riot Sans Latin', Arial, sans-serif;
  --font-body: 'Inter', 'Inter V Latin', Arial, sans-serif;
  --font-condensed: 'Oswald', Arial, sans-serif;
  --tracking: -0.03em;
  --lh-tight: 0.9; --lh-heading: 1.1; --lh-body: 1.5; --lh-relaxed: 1.667;

  /* Espaço */
  --space-2: 8px; --space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 30px;
  --space-10: 40px; --space-12: 50px; --space-15: 60px; --space-20: 80px; --space-25: 100px;
  --gutter: 20px; --gutter-md: 40px; --gutter-lg: 80px;
  --container: 1440px; --container-narrow: 953.333px; --container-text: 466.667px;

  /* Forma */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 24px; --radius-pill: 32px;
  --shadow-card: 0 4px 16px rgba(10,10,10,.2);
  --focus-ring: 0 0 0 2px var(--color-gold);
  --clip-parallelogram: polygon(0 0, 95% 0, 100% 100%, 5% 100%);
  --clip-corner: polygon(10% 0, 100% 0, 100% 100%, 0 100%);

  /* Motion */
  --ease: cubic-bezier(.215,.61,.355,1);
  --ease-dramatic: cubic-bezier(.86,0,.07,1);
  --dur-fast: .1s; --dur-base: .2s; --dur-slow: .3s; --dur-reveal: 1s;
}
```

---

## 10. Do / Don't

**Faça**
- Títulos enormes, pesados, uppercase, com line-height < 1.
- Fundo escuro contínuo; separe seções por espaço (50–100px), não por linhas.
- Imagens em grayscale que ganham cor no hover.
- Um clip-path diagonal por seção, no máximo.
- Vermelho apenas em ações.

**Não faça**
- Branco puro (`#FFF`) em grandes áreas de texto — use `#E7E6E3`.
- Sombras fortes ou bordas grossas em cards.
- Mais de um acento de cor.
- Gradientes coloridos em fundo — o site só usa gradiente em hover de botão.
- Cantos muito arredondados em cards (máx. 12px); pill só em botões e tags.
