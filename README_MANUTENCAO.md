# Sistema de Manutenção de Computadores

Este é um projeto Node.js com Express e MongoDB para gerenciar solicitações e execução de manutenção de computadores.

## Estrutura do Projeto

O projeto foi adaptado de um sistema de aluguel de carros para um sistema de manutenção de computadores. As principais mudanças foram:

### Modelos (Models)

1. **Computador** (`models/computador.js`) - Substitui o modelo de Carro
   - serial (único)
   - modelo
   - marca
   - tipo (Desktop, Notebook, Tablet, Outro)
   - processador
   - memoria
   - armazenamento
   - sistemaOperacional
   - observacoes
   - imagem

2. **Manutenção** (`models/manutencao.js`) - Substitui o modelo de Reserva
   - computador (referência)
   - cliente (referência)
   - dataSolicitacao
   - dataInicio
   - dataFinalizacao
   - problemaSolicitado
   - diagnostico
   - servicosRealizados
   - pecasTrocadas
   - valorTotal
   - status (pendente, em_andamento, finalizado, cancelado)

3. **Cliente** - Mantido do projeto original
4. **Usuario** - Mantido do projeto original

### Controllers

- `controllers/computador.js` - CRUD de computadores
- `controllers/manutencao.js` - CRUD de manutenções (com suporte a status e relatórios)

### Rotas

- `/computadores` - Listar, criar, editar e deletar computadores
- `/manutencoes` - Listar, criar, editar e deletar manutenções
- `/clientes` - Gestão de clientes
- `/auth` - Autenticação

### Views

#### Computador
- `views/computador/list.ejs` - Listar computadores
- `views/computador/form.ejs` - Formulário para criar/editar
- `views/computador/view.ejs` - Visualizar detalhes

#### Manutenção
- `views/manutencao/list.ejs` - Listar manutenções com status
- `views/manutencao/form.ejs` - Formulário para solicitação e acompanhamento
- `views/manutencao/view.ejs` - Visualizar detalhes completos da manutenção

## Fluxo de Uso

### 1. Cadastrar Computadores
Vá para `/computadores/novo` para adicionar um novo computador ao sistema. Preencha os dados básicos como serial, marca, modelo, tipo, processador, memória, armazenamento e sistema operacional.

### 2. Solicitar Manutenção
Vá para `/manutencoes/novo` para criar uma nova solicitação de manutenção. Selecione:
- Computador a ser mantido
- Cliente
- Descrição do problema

### 3. Acompanhar Manutenção
Na listagem de manutenções (`/manutencoes`), você pode:
- Ver o status atual (pendente, em andamento, finalizado, cancelado)
- Clicar em "Editar" para atualizar:
  - Status da manutenção
  - Data de início e finalização
  - Diagnóstico realizado
  - Serviços realizados
  - Peças trocadas
  - Valor cobrado

### 4. Relatórios
Ao visualizar uma manutenção (`/manutencoes/:id`), você verá:
- Informações do computador e cliente
- Problema solicitado
- Diagnóstico realizado
- Serviços executados
- Peças trocadas
- Valor total da manutenção

## Instalação e Uso

```bash
# Instalar dependências
npm install

# Executar o servidor
npm start

# Ou usar nodemon para desenvolvimento
nodemon indexvercell.js
```

O servidor rodará na porta 3001.

## Tecnologias Utilizadas

- **Express.js** - Framework web
- **MongoDB** - Banco de dados
- **Mongoose** - ODM para MongoDB
- **EJS** - Template engine
- **Bootstrap 5** - Framework CSS
- **Multer** - Upload de arquivos (imagens)

## Funcionalidades Principais

✅ Cadastro e gerenciamento de computadores  
✅ Solicitação de manutenção  
✅ Acompanhamento de status  
✅ Registro detalhado do que foi feito (diagnóstico, serviços, peças)  
✅ Gestão de clientes  
✅ Autenticação de usuários  
✅ Upload de imagens dos computadores  
✅ Interface responsiva com Bootstrap

## Próximas Melhorias

- Relatórios em PDF
- Notificações por email
- Dashboard com estatísticas
- Histórico de manutenções por cliente/computador
- Sistema de backup automático
- Integração com whatsapp para notificação de clientes

---

**Desenvolvido adaptando o sistema de aluguel de carros para gerenciamento de manutenção de computadores.**
