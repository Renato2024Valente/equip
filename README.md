# Controle de Notebooks - Next.js + MongoDB

Projeto pronto para cadastro e controle de notebooks com:

- Next.js (App Router)
- MongoDB
- Vercel Functions
- CRUD completo
- filtros
- exportação CSV
- visual moderno

## 1. Instalar

```bash
npm install
```

## 2. Criar o arquivo `.env.local`

Copie `.env.local.example` para `.env.local` e preencha:

```env
MONGODB_URI=mongodb+srv://USUARIO:SENHA@SEUCLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=controle_notebooks
```

## 3. Rodar localmente

```bash
npm run dev
```

Abra:

```bash
http://localhost:3000
```

## 4. Estrutura

- `app/page.js` → tela principal
- `app/api/notebooks/route.js` → listar e salvar
- `app/api/notebooks/[id]/route.js` → editar e excluir
- `lib/mongodb.js` → conexão com MongoDB

## 5. Deploy na Vercel

Na Vercel, adicione estas variáveis de ambiente:

- `MONGODB_URI`
- `MONGODB_DB`

Depois faça o deploy.

## 6. Observação

O sistema já está preparado para usar `attachDatabasePool` com MongoDB na Vercel.
