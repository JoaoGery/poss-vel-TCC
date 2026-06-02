import express from 'express';
import Cliente from '../models/cliente.js';

const router = express.Router();

// 🔹 LISTAR CLIENTES
router.get('/', async (req, res) => {
    try {
        const clientes = await Cliente.find().lean();
        res.render('cliente/lst', { clientes }); // renderiza a view
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao listar clientes');
    }
});

// 🔹 FORMULÁRIO PARA ADICIONAR CLIENTE
router.get('/add', (req, res) => {
    res.render('cliente/add');
});

// 🔹 SALVAR NOVO CLIENTE
router.post('/add', async (req, res) => {
    try {
        const { nome, email, telefone } = req.body;

        const novoCliente = new Cliente({ nome, email, telefone });
        await novoCliente.save();

        res.redirect('/cliente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao criar cliente');
    }
});

// 🔹 FORMULÁRIO PARA EDITAR CLIENTE
router.get('/edit/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id).lean();
        if (!cliente) return res.status(404).send('Cliente não encontrado');

        res.render('cliente/edit', { cliente });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar cliente');
    }
});

// 🔹 SALVAR ALTERAÇÕES
router.post('/edit/:id', async (req, res) => {
    try {
        const { nome, email, telefone } = req.body;
        await Cliente.findByIdAndUpdate(req.params.id, { nome, email, telefone });
        res.redirect('/cliente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar cliente');
    }
});

// 🔹 DELETAR CLIENTE
router.get('/delete/:id', async (req, res) => {
    try {
        await Cliente.findByIdAndDelete(req.params.id);
        res.redirect('/cliente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar cliente');
    }
});

export default router;
