import express from 'express';
import Cliente from '../models/cliente.js';

const router = express.Router();

const clienteData = (body) => ({
    nome: body.nome,
    documento: body.documento || '',
    email: body.email,
    telefone: body.telefone,
    endereco: body.endereco || '',
    cidade: body.cidade || '',
    estado: body.estado || '',
    cep: body.cep || ''
});

// 🔹 LISTAR CLIENTES
router.get('/', async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        const filtro = q
            ? {
                $or: [
                    { nome: { $regex: q, $options: 'i' } },
                    { email: { $regex: q, $options: 'i' } },
                    { telefone: { $regex: q, $options: 'i' } }
                ]
            }
            : {};

        const clientes = await Cliente.find(filtro).sort({ nome: 1 }).lean();
        res.render('cliente/lst', { clientes, q });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao listar clientes');
    }
});

// 🔹 FORMULÁRIO PARA ADICIONAR CLIENTE
router.get(['/novo', '/add'], (req, res) => {
    res.render('cliente/add', { cliente: {} });
});

// 🔹 SALVAR NOVO CLIENTE
router.post(['/', '/add'], async (req, res) => {
    try {
        await Cliente.create(clienteData(req.body));
        res.redirect('/cliente');
    } catch (err) {
        console.error(err);
        if (err.code === 11000) return res.status(400).send('Email já cadastrado');
        res.status(500).send('Erro ao criar cliente');
    }
});

// 🔹 FORMULÁRIO PARA EDITAR CLIENTE
router.get(['/:id/editar', '/editar/:id', '/edit/:id'], async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id).lean();
        if (!cliente) return res.status(404).send('Cliente não encontrado');

        res.render('cliente/edt', { cliente });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar cliente');
    }
});

// 🔹 SALVAR ALTERAÇÕES
router.post(['/:id/atualizar', '/editar/:id', '/edit/:id'], async (req, res) => {
    try {
        await Cliente.findByIdAndUpdate(req.params.id, clienteData(req.body), { runValidators: true });
        res.redirect('/cliente');
    } catch (err) {
        console.error(err);
        if (err.code === 11000) return res.status(400).send('Email já cadastrado');
        res.status(500).send('Erro ao atualizar cliente');
    }
});

// 🔹 DELETAR CLIENTE
router.post(['/:id/deletar', '/excluir/:id'], async (req, res) => {
    try {
        await Cliente.findByIdAndDelete(req.params.id);
        res.redirect('/cliente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar cliente');
    }
});

router.get(['/delete/:id', '/excluir/:id'], async (req, res) => {
    try {
        await Cliente.findByIdAndDelete(req.params.id);
        res.redirect('/cliente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar cliente');
    }
});

export default router;
