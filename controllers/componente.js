import Componente from '../models/componente.js';

export const list = async (req, res) => {
  try {
    const componentes = await Componente.find().lean();
    res.render('componente/list', { componentes });
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
  res.render('componente/form', { componente: {} });
};

export const create = async (req, res) => {
  try {
    const data = {
      nome: req.body.nome,
      categoria: req.body.categoria,
      quantidadeDisponivel: req.body.quantidadeDisponivel ? Number(req.body.quantidadeDisponivel) : 0,
      precoUnitario: req.body.precoUnitario ? Number(req.body.precoUnitario) : 0,
      descricao: req.body.descricao,
      fornecedor: req.body.fornecedor
    };

    await Componente.create(data);
    res.redirect('/componentes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar componente');
  }
};

export const formEdit = async (req, res) => {
  try {
    const componente = await Componente.findById(req.params.id).lean();
    if (!componente) return res.status(404).send('Componente não encontrado');
    res.render('componente/form', { componente });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir edição');
  }
};

export const update = async (req, res) => {
  try {
    const update = {
      nome: req.body.nome,
      categoria: req.body.categoria,
      quantidadeDisponivel: req.body.quantidadeDisponivel ? Number(req.body.quantidadeDisponivel) : 0,
      precoUnitario: req.body.precoUnitario ? Number(req.body.precoUnitario) : 0,
      descricao: req.body.descricao,
      fornecedor: req.body.fornecedor
    };

    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    await Componente.findByIdAndUpdate(req.params.id, update);
    res.redirect('/componentes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar componente');
  }
};

export const remove = async (req, res) => {
  try {
    await Componente.findByIdAndDelete(req.params.id);
    res.redirect('/componentes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir componente');
  }
};
