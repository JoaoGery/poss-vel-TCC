import Cliente from '../models/cliente.js';
import Manutencao from '../models/manutencao.js';
import { normalizeEmail, sanitizeText, isValidEmail } from '../utils/validators.js';
import { setFlash } from '../utils/flash.js';

const clienteData = (body = {}) => ({
  nome: sanitizeText(body.nome),
  documento: sanitizeText(body.documento),
  email: normalizeEmail(body.email),
  telefone: sanitizeText(body.telefone),
  endereco: sanitizeText(body.endereco),
  cidade: sanitizeText(body.cidade),
  estado: sanitizeText(body.estado).toUpperCase(),
  cep: sanitizeText(body.cep)
});

export const list = async (req, res) => {
  try {
    const q = sanitizeText(req.query?.q);
    const filtro = q ? {
      $or: [
        { nome: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { telefone: { $regex: q, $options: 'i' } }
      ]
    } : {};

    const clientes = await Cliente.find(filtro).sort({ nome: 1 }).lean();
    return res.render('cliente/lst', { clientes, q });
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    return res.status(500).send('Erro ao listar clientes.');
  }
};

export const view = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) return res.status(404).send('Cliente não encontrado.');
    return res.redirect(`/cliente/${cliente._id}/editar`);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    return res.status(500).send('Erro ao buscar cliente.');
  }
};

export const formCreate = (req, res) => {
  return res.render('cliente/add', { cliente: {}, error: null });
};

export const create = async (req, res) => {
  try {
    const data = clienteData(req.body);

    if (!data.nome || !data.email || !data.telefone || !isValidEmail(data.email)) {
      return res.status(400).render('cliente/add', {
        cliente: data,
        error: 'Informe nome, telefone e um e-mail válido para cadastrar o cliente.'
      });
    }

    await Cliente.create(data);
    setFlash(req, 'success', 'Cliente cadastrado com sucesso.');
    return res.redirect('/cliente');
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    const message = err.code === 11000 ? 'E-mail já cadastrado.' : 'Erro ao criar cliente.';
    return res.status(400).render('cliente/add', { cliente: req.body, error: message });
  }
};

export const formEdit = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) return res.status(404).send('Cliente não encontrado.');
    return res.render('cliente/edt', { cliente, error: null });
  } catch (err) {
    console.error('Erro ao abrir edição:', err);
    return res.status(500).send('Erro ao abrir edição.');
  }
};

export const update = async (req, res) => {
  try {
    const data = clienteData(req.body);

    if (!data.nome || !data.email || !data.telefone || !isValidEmail(data.email)) {
      return res.status(400).render('cliente/edt', {
        cliente: { ...data, _id: req.params.id },
        error: 'Informe nome, telefone e um e-mail válido para atualizar o cliente.'
      });
    }

    const cliente = await Cliente.findByIdAndUpdate(req.params.id, data, { runValidators: true, new: true });
    if (!cliente) return res.status(404).render('error', { statusCode: 404, title: 'Cliente não encontrado', message: 'O cliente que você tentou atualizar não existe.' });
    setFlash(req, 'success', 'Dados do cliente atualizados.');
    return res.redirect('/cliente');
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    const message = err.code === 11000 ? 'E-mail já cadastrado.' : 'Erro ao atualizar cliente.';
    return res.status(400).render('cliente/edt', { cliente: { ...req.body, _id: req.params.id }, error: message });
  }
};

export const remove = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.redirect('/cliente');

    const possuiManutencoes = await Manutencao.exists({ cliente: cliente._id });
    if (possuiManutencoes) {
      setFlash(req, 'warning', 'Este cliente possui ordens de serviço vinculadas e não pode ser excluído.');
      return res.redirect('/cliente');
    }

    await Cliente.findByIdAndDelete(req.params.id);
    setFlash(req, 'success', 'Cliente excluído com sucesso.');
    return res.redirect('/cliente');
  } catch (err) {
    console.error('Erro ao excluir cliente:', err);
    return res.status(500).send('Erro ao excluir cliente.');
  }
};
