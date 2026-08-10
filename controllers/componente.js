import Componente from '../models/componente.js';
import Manutencao from '../models/manutencao.js';
import { parsePositiveNumber, sanitizeText } from '../utils/validators.js';
import { setFlash } from '../utils/flash.js';

const componentData = (body = {}) => ({
  nome: sanitizeText(body.nome),
  categoria: sanitizeText(body.categoria),
  quantidadeDisponivel: parsePositiveNumber(body.quantidadeDisponivel),
  precoUnitario: parsePositiveNumber(body.precoUnitario),
  descricao: sanitizeText(body.descricao),
  fornecedor: sanitizeText(body.fornecedor)
});

export const list = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const categoria = (req.query.categoria || '').trim();
    const filtro = {};

    if (q) {
      filtro.$or = [
        { nome: { $regex: q, $options: 'i' } },
        { fornecedor: { $regex: q, $options: 'i' } },
        { descricao: { $regex: q, $options: 'i' } }
      ];
    }

    if (categoria) {
      filtro.categoria = categoria;
    }

    const componentes = await Componente.find(filtro).sort({ nome: 1 }).lean();
    res.render('componente/list', { componentes, q, categoria });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar componentes');
  }
};

export const view = async (req, res) => {
  try {
    const componente = await Componente.findById(req.params.id).lean();
    if (!componente) return res.status(404).send('Componente não encontrado');
    res.render('componente/view', { componente });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar componente');
  }
};

export const formCreate = (req, res) => {
  res.render('componente/form', { componente: {}, error: null });
};

export const create = async (req, res) => {
  try {
    const data = componentData(req.body);

    if (!data.nome || !data.categoria) {
      return res.status(400).render('componente/form', {
        componente: data,
        error: 'Informe o nome e a categoria do componente.'
      });
    }

    await Componente.create(data);
    setFlash(req, 'success', 'Componente cadastrado no estoque.');
    return res.redirect('/componentes');
  } catch (err) {
    console.error(err);
    res.status(400).render('componente/form', { componente: req.body, error: 'Erro ao criar componente.' });
  }
};

export const formEdit = async (req, res) => {
  try {
    const componente = await Componente.findById(req.params.id).lean();
    if (!componente) return res.status(404).send('Componente não encontrado');
    res.render('componente/form', { componente, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir edição');
  }
};

export const update = async (req, res) => {
  try {
    const update = componentData(req.body);

    if (!update.nome || !update.categoria) {
      return res.status(400).render('componente/form', {
        componente: { ...update, _id: req.params.id },
        error: 'Informe o nome e a categoria do componente.'
      });
    }

    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const componente = await Componente.findByIdAndUpdate(req.params.id, update, { runValidators: true, new: true });
    if (!componente) return res.status(404).render('error', { statusCode: 404, title: 'Componente não encontrado', message: 'O componente que você tentou atualizar não existe.' });
    setFlash(req, 'success', 'Componente atualizado com sucesso.');
    return res.redirect('/componentes');
  } catch (err) {
    console.error(err);
    res.status(400).render('componente/form', { componente: { ...req.body, _id: req.params.id }, error: 'Erro ao atualizar componente.' });
  }
};

export const remove = async (req, res) => {
  try {
    const componente = await Componente.findById(req.params.id);
    if (!componente) return res.redirect('/componentes');

    const emUso = await Manutencao.exists({ componentes: componente._id });
    if (emUso) {
      setFlash(req, 'warning', 'Este componente está vinculado a uma ordem de serviço e não pode ser excluído.');
      return res.redirect('/componentes');
    }

    await Componente.findByIdAndDelete(req.params.id);
    setFlash(req, 'success', 'Componente excluído do estoque.');
    return res.redirect('/componentes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir componente');
  }
};
