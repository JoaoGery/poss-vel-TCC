# AssistTech - Sistema de Assistência Técnica

Aplicação web para gestão de assistência técnica de computadores, desenvolvida com Node.js, Express, EJS, Bootstrap e MongoDB. O sistema organiza clientes, ordens de manutenção e componentes de estoque, oferecendo um fluxo simples para abertura, acompanhamento e conclusão de serviços.

## Funcionalidades

- Dashboard com indicadores de clientes, manutenções por status e componentes cadastrados.
- Cadastro, edição, busca e exclusão de clientes.
- Abertura de ordens de manutenção por cliente e equipamento.
- Acompanhamento de status: em análise, em reparo e concluído.
- Registro de diagnóstico técnico, observações, valor total e data de saída.
- Catálogo de componentes com categoria, estoque, preço e fornecedor.
- Associação de componentes utilizados em uma manutenção.
- Geração automática de número de ordem de serviço (ex.: `OS-2026-0001`).
- Baixa e devolução de estoque com validação de disponibilidade.
- Alertas de estoque baixo e faturamento de serviços concluídos no dashboard.
- Impressão dos detalhes da ordem de serviço.
- Autenticação básica de usuários com senha criptografada.
- Interface responsiva e padronizada para uso em desktop e celular.

## Tecnologias

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS
- Bootstrap 5
- bcryptjs
- express-session
- connect-mongo

## Estrutura principal

```text
controllers/      Regras das telas e operações do sistema
models/           Modelos Mongoose de Cliente, Manutencao, Componente e Usuario
routes/           Definição das rotas HTTP
views/            Templates EJS renderizados pelo Express
views/partials/   Cabeçalho e rodapé compartilhados
public/css/       Estilos próprios da aplicação
api/index.js      Entrada para deploy na Vercel
index.js          Entrada para execução local
```

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/manutencao_computadores
SESSION_SECRET=uma_chave_segura_para_sessao
```

3. Inicie o projeto:

```bash
npm start
```

O sistema ficará disponível em `http://localhost:3001`.

## Rotas principais

- `/` - Dashboard
- `/cliente` - Gestão de clientes
- `/manutencoes` - Gestão de ordens de manutenção
- `/componentes` - Gestão de componentes
- `/auth/login` - Login
- `/auth/register` - Cadastro de usuário

## Regras de negócio importantes

- Cada componente selecionado em uma ordem consome uma unidade do estoque; ao removê-lo da ordem ou excluir a ordem, a unidade é devolvida.
- Clientes e componentes vinculados a ordens de serviço não podem ser excluídos, preservando a rastreabilidade dos atendimentos.
- Ao concluir uma ordem, a data de saída é registrada automaticamente e o valor entra no faturamento exibido no painel.

## Observações para apresentação

Antes da demonstração, cadastre ao menos um usuário, alguns clientes, componentes e manutenções. Isso permite que o dashboard apresente indicadores e que o fluxo completo de abertura, edição e conclusão de uma manutenção fique visível para a banca.
