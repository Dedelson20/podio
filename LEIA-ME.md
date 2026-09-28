# Pódio

Enciclopédia dos esportes dos Jogos de Verão e de Inverno, em formato de app instalável (PWA). Funciona offline e pode ser instalado na tela inicial do Android e do iPhone.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Página do app (visual e estrutura) |
| `app.js` | Busca, filtros, favoritos, compartilhar, instalação |
| `data/esportes.js` | Conteúdo base dos 56 esportes |
| `data/atualizacoes.json` | Correções semanais (recordes, atletas, regras), com fontes |
| `sw.js` | Modo offline |
| `manifest.webmanifest` e `icons/` | Nome, cores e ícones do app instalado |

## Publicar grátis no GitHub Pages

1. Crie uma conta em github.com e um repositório público chamado `podio`.
2. Envie o conteúdo desta pasta para o repositório (botão "Add file" → "Upload files", ou `git push`).
3. No repositório: Settings → Pages → Source: "Deploy from a branch" → branch `main`, pasta `/ (root)` → Save.
4. Em cerca de um minuto o app fica em `https://SEU-USUARIO.github.io/podio/`.

Netlify ou Vercel também funcionam: basta arrastar a pasta para o painel.

## Instalar no celular

- **Android (Chrome):** abra o endereço e toque em "Instalar" no aviso do app, ou no menu ⋮ → "Instalar app".
- **iPhone (Safari):** toque em Compartilhar → "Adicionar à Tela de Início".

## Publicar nas lojas (opcional)

- **Google Play:** em pwabuilder.com, informe o endereço publicado e gere o pacote Android. Conta de desenvolvedor Google Play: US$ 25, pagamento único.
- **App Store:** exige conta Apple Developer (US$ 99/ano) e empacotamento com Capacitor. A Apple tende a recusar apps que só exibem um site; os favoritos e o modo offline ajudam, e notificações de "recorde batido" fortalecem o pedido.
- Antes de enviar a qualquer loja: não use "Olímpico", "Jogos Olímpicos" ou os anéis no nome, no ícone ou nas imagens de divulgação. São marcas protegidas pelo COI e pelo COB.

## Testar no computador

O modo offline e a instalação só funcionam servidos por `http://localhost` ou `https://`, não abrindo o arquivo direto.
