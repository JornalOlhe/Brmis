# BRMIS Construtora

Site institucional da BRMIS Construtora.

## Desenvolvimento

```sh
npm install
npm run dev
```

## GitHub Pages

O projeto está preparado para gerar uma versão estática no branch `gh-pages` através do workflow `.github/workflows/pages.yml`.

URL prevista:

https://jornalolhe.github.io/Brmis/

## Stack

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Domínio próprio (Cloudflare Pages)

Configuração do projeto no Cloudflare Pages (branch `main`):

- Build command: `bun install && bun run build`
- Build output directory: `.output/public`
- Variáveis de ambiente:
  - `STATIC_EXPORT` = `true`
  - `VITE_SITE_URL` = `https://SEU-DOMINIO` (ex.: `https://brmis.com.br`)
