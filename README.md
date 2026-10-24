# Pulso — Frontend

Plataforma de regulação da fila de cirurgias eletivas. Duas áreas separadas:

- **Pública** (`/`, `/como-funciona`): o paciente consulta só o próprio encaminhamento com CPF ou Cartão Nacional de Saúde e data de nascimento.
- **Profissional** (`/profissional/*`): médicos reguladores autenticados acessam Visão geral, Fila, Revisão humana, Pendências e Dados.

## Rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Para gerar a versão de produção: `npm run build`.

## Stack

React 19, React Router, Tailwind CSS 4, Vite, TypeScript.

## Como a fila é ordenada

`src/data/fila.ts` e `src/lib/prioridade.ts`

1. **Nível** — 7 níveis (G1 dividido em a/b), cada um com prazo de referência:

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

2. Dentro do nível, **pontuação** = gravidade (0–40) + piora recente (0–25) + tempo de espera (0–20, % do prazo) + risco (0–15).
3. **Regra de ouro:** CID iniciado por `C` não pode ir abaixo de G3; a Visão geral verifica a fila inteira e mostra o resultado.

O sistema só **propõe** mudanças (Revisão humana); o regulador confirma ou mantém, sempre com justificativa.

## Dados

`src/data/` — pacientes acompanhados de perto + o restante da fila gerado de forma determinística (897 ativas, distribuídas pelos níveis). Marcações de revisão em `revisao.ts`, pendências operacionais em `pendencias.ts` e o resumo da carga em `dados.ts`. Data de referência: 23/10/2026.

As decisões ficam registradas no `localStorage` (`pulso:decisoes:v2`) e são reaplicadas sobre a base, então a área pública e a profissional sempre leem o mesmo estado. Para voltar ao estado inicial, apague essa chave.

### Fluxo principal (Maria Oliveira)

1. Consulta pública: CPF `529.982.247-25`, nascimento `14/03/1974` → nível 6 de 7.
2. Entrar como profissional (qualquer identificação e senha com 4+ caracteres).
3. Revisão humana → Maria Oliveira (G6 → G4) → Confirmar alteração com justificativa.
4. A fila recalcula e a consulta pública passa a mostrar nível 4 de 7 com a data da revisão.
