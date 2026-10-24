# Pulso — Frontend

Plataforma de regulação da fila de cirurgias eletivas. Duas áreas separadas:

- **Pública** (`/`, `/como-funciona`): o paciente consulta só o próprio encaminhamento com CPF ou Cartão Nacional de Saúde e data de nascimento.
- **Profissional** (`/profissional/*`): médicos reguladores acessam Visão geral, Fila, Revisão humana, Pendências e Dados, lendo e decidindo direto na API do [Pulso-Backend](../Pulso-Backend).

## Rodar

1. Suba o backend (no repositório `Pulso-Backend`, branch `integracao`): banco, pipeline e API em `http://localhost:8000`. O passo a passo está no README de lá.
2. No front:

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Para apontar para outra API, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

**Entrada profissional:** use o CRM de um médico cadastrado no backend (ex.: `CRM-RS 900001`, lista em `GET /medicos`) e qualquer senha com 4+ caracteres. O backend ainda não tem autenticação; o CRM identifica quem decide.

## Stack

React 19, React Router, Tailwind CSS 4, Vite, TypeScript.

## Integração com a API

`src/api/` — cliente (`cliente.ts`), tipos das respostas (`tipos.ts`), hook de carregamento (`useApi.ts`) e rótulos dos códigos do motor (`rotulos.ts`).

| Tela | Endpoints |
| --- | --- |
| Visão geral | `GET /resumo`, `GET /marcacoes?severidade=alta` |
| Fila | `GET /fila?modo=oficial` |
| Paciente | `GET /solicitacoes/{id}` |
| Revisão humana | `GET /mudancas`, `POST /mudancas/{id}/decisao`, `POST /eventos/processar` |
| Pendências | `GET /pendencias` |
| Dados | `GET /dados`, `GET /resumo` |
| Entrada | `GET /medicos` |

A fila oficial só muda quando o médico aprova um pedido na Revisão humana; a regra de ouro é conferida pelo backend a cada aprovação.

## Níveis da fila

| Nível | Nome | Prazo |
| --- | --- | --- |
| G1a | Oncológico em progressão | 15 d |
| G1b | Agudo não oncológico | 15 d |
| G2 | Oncológico confirmado | 21 d |
| G3 | Suspeita oncológica | 60 d |
| G4 | Deterioração recente | 60 d |
| G5 | Alta carga de sintomas | 60 d |
| G6 | Sintomático moderado | 180 d |
| G7 | Eletivo estável | 360 d |

## Área pública

O dataset não tem CPF nem data de nascimento, então a consulta pública ainda usa dados locais (`src/data/`, `src/store/`). Para testar: CPF `529.982.247-25`, nascimento `14/03/1974`.
