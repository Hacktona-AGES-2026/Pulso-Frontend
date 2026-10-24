# Pulso — Frontend

Plataforma de regulação da fila de cirurgias eletivas. Duas áreas separadas:

- **Pública** (`/`, `/como-funciona`): o paciente consulta só o próprio encaminhamento com CPF ou Cartão Nacional de Saúde e data de nascimento.
- **Profissional** (`/profissional/*`): médicos reguladores autenticados veem a fila priorizada, os detalhes clínicos e decidem as revisões de prioridade propostas pelo sistema.

## Rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Para gerar a versão de produção: `npm run build`.

## Stack

React 19, React Router, Tailwind CSS 4, Vite, TypeScript.

## Como a fila é ordenada

`src/lib/prioridade.ts`

1. **Classe de prioridade** (A Urgente · B Prioritário · C Eletivo · D Programável), cada uma com prazo de referência (21, 60, 180 e 365 dias).
2. Dentro da classe, **pontuação** = gravidade (0–40) + piora recente (0–25, eventos de piora nos últimos 30 dias) + tempo de espera (0–20, % do prazo) + risco (0–15).
3. **Regra de ouro:** CID iniciado por `C` nunca fica abaixo de B, e o ajuste manual bloqueia C/D para esses pacientes. Assim nenhum oncológico fica abaixo de um caso sem urgência.

O sistema só **propõe** mudanças (Revisões pendentes); o regulador confirma ou mantém, sempre com justificativa.

## Dados

`src/data/` — 20 pacientes acompanhados de perto + o restante da fila gerado de forma determinística (895 no total). Data de referência: 23/10/2026.

As decisões ficam registradas no `localStorage` (`pulso:decisoes:v1`) e são reaplicadas sobre a base, então a área pública e a profissional sempre leem o mesmo estado. Para voltar ao estado inicial, apague essa chave.

### Fluxo principal (Maria Oliveira)

1. Consulta pública: CPF `529.982.247-25`, nascimento `14/03/1974` → prioridade C · Eletivo.
2. Entrar como profissional (qualquer identificação e senha com 4+ caracteres).
3. Revisões pendentes → Maria Oliveira (C → B) → Confirmar alteração com justificativa.
4. A fila recalcula (posição 83 → 21) e a consulta pública passa a mostrar B · Prioritário com a data da revisão.
