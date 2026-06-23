import Manutencao from '../models/manutencao.js';
import Componente from '../models/componente.js';
import Cliente from '../models/cliente.js';

const normalizeComponentIds = (ids = []) => {
  const list = Array.isArray(ids) ? ids : [ids];
  return [...new Set(list.filter(Boolean).map(String))];
};

const getComponentDiff = (previousIds = [], nextIds = []) => {
  const previous = normalizeComponentIds(previousIds.map(id => id?._id || id));
  const next = normalizeComponentIds(nextIds);

  return {
    added: next.filter(id => !previous.includes(id)),
    removed: previous.filter(id => !next.includes(id))
  };
};

const updateComponentStock = async ({ added = [], removed = [] }) => {
  if (added.length) {
    const available = await Componente.find({ _id: { $in: added } }).lean();
    const unavailable = available.find(component => Number(component.quantidadeDisponivel || 0) <= 0);

    if (available.length !== added.length || unavailable) {
      const name = unavailable?.nome || 'componente selecionado';
      const error = new Error(`Não há estoque disponível para ${name}.`);
      error.name = 'StockError';
      throw error;
    }
  }

  await Promise.all([
    ...added.map(id => Componente.updateOne({ _id: id }, { $inc: { quantidadeDisponivel: -1 } })),
    ...removed.map(id => Componente.updateOne({ _id: id }, { $inc: { quantidadeDisponivel: 1 } }))
  ]);
};

const renderMaintenanceForm = async (res, statusCode, manutencao, error) => {
  const [clientes, componentes] = await Promise.all([
    Cliente.find().sort({ nome: 1 }).lean(),
    Componente.find().sort({ nome: 1 }).lean()
  ]);

  return res.status(statusCode).render('manutencao/form', {
    manutencao,
    clientes,
    componentes,
    error
  });
};

export const list = async (req, res) => {
  try {
    const status = (req.query.status || '').trim();
    const q = (req.query.q || '').trim();
    const filtro = {};

    if (['em_analise', 'em_reparo', 'concluido'].includes(status)) {
      filtro.status = status;
    }

    if (q) {
      filtro.$or = [
        { marcaComputador: { $regex: q, $options: 'i' } },
        { modeloComputador: { $regex: q, $options: 'i' } },
        { descricaoProblema: { $regex: q, $options: 'i' } }
      ];
    }

    const manutencoes = await Manutencao.find(filtro)
      .populate('cliente componentes')
      .sort({ dataEntrada: -1 })
      .lean();

    res.render('manutencao/list', { manutencoes, q, status });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar manutenções');
  }
};

export const view = async (req, res) => {
  try {
    const manutencao = await Manutencao.findById(req.params.id).populate('cliente componentes').lean();
    if (!manutencao) return res.status(404).send('Manutenção não encontrada');
    res.render('manutencao/view', { manutencao });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar manutenção');
  }
};

export const formCreate = async (req, res) => {
  try {
    const [clientes, componentes] = await Promise.all([
      Cliente.find().sort({ nome: 1 }).lean(),
      Componente.find().sort({ nome: 1 }).lean()
    ]);
    res.render('manutencao/form', { manutencao: {}, clientes, componentes, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir formulário de manutenção');
  }
};

export const create = async (req, res) => {
  try {
    const clienteId = req.body.cliente;
    const marcaComputador = (req.body.marcaComputador || '').trim();
    const modeloComputador = (req.body.modeloComputador || '').trim();
    const descricaoProblema = (req.body.descricaoProblema || '').trim();
    const componentes = normalizeComponentIds(req.body.componentes);

    if (!clienteId || !marcaComputador || !modeloComputador || !descricaoProblema) {
      return renderMaintenanceForm(
        res,
        400,
        { cliente: clienteId, marcaComputador, modeloComputador, descricaoProblema, componentes },
        'Selecione um cliente e informe os dados do equipamento e do problema.'
      );
    }

    const cliente = await Cliente.findById(clienteId);
    
    if (!cliente) return res.status(400).send('Cliente inválido');

    await updateComponentStock({ added: componentes });

    await Manutencao.create({
      cliente: clienteId,
      marcaComputador,
      modeloComputador,
      descricaoProblema,
      componentes,
      status: 'em_analise'
    });

    res.redirect('/manutencoes');
  } catch (err) {
    console.error(err);
    if (err.name === 'StockError') {
      return renderMaintenanceForm(
        res,
        400,
        {
          cliente: req.body.cliente,
          marcaComputador: req.body.marcaComputador,
          modeloComputador: req.body.modeloComputador,
          descricaoProblema: req.body.descricaoProblema,
          componentes: normalizeComponentIds(req.body.componentes)
        },
        err.message
      );
    }
    res.status(500).send('Erro ao criar manutenção');
  }
};

export const formEdit = async (req, res) => {
  try {
    const [manutencao, clientes, componentes] = await Promise.all([
      Manutencao.findById(req.params.id).lean(),
      Cliente.find().sort({ nome: 1 }).lean(),
      Componente.find().sort({ nome: 1 }).lean()
    ]);
    
    if (!manutencao) return res.status(404).send('Manutenção não encontrada');
    res.render('manutencao/form', { manutencao, clientes, componentes, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir edição');
  }
};

export const update = async (req, res) => {
  try {
    const { cliente, status } = req.body;
    const componentes = normalizeComponentIds(req.body.componentes);
    const manutencaoAtual = await Manutencao.findById(req.params.id).lean();

    if (!manutencaoAtual) return res.status(404).send('Manutenção não encontrada');
    
    const update = {
      cliente,
      marcaComputador: (req.body.marcaComputador || '').trim(),
      modeloComputador: (req.body.modeloComputador || '').trim(),
      descricaoProblema: (req.body.descricaoProblema || '').trim(),
      diagnosticoTecnico: (req.body.diagnosticoTecnico || '').trim(),
      status,
      componentes,
      valorTotal: req.body.valorTotal ? Number(req.body.valorTotal) : 0,
      observacoes: (req.body.observacoes || '').trim()
    };

    if (!update.cliente || !update.marcaComputador || !update.modeloComputador || !update.descricaoProblema) {
      return renderMaintenanceForm(
        res,
        400,
        { ...manutencaoAtual, ...update, _id: req.params.id },
        'Selecione um cliente e informe os dados do equipamento e do problema.'
      );
    }

    const unset = {};

    if (status === 'concluido') {
      update.dataSaida = new Date();
    } else {
      unset.dataSaida = '';
    }

    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const stockDiff = getComponentDiff(manutencaoAtual.componentes, componentes);
    await updateComponentStock(stockDiff);

    await Manutencao.findByIdAndUpdate(
      req.params.id,
      Object.keys(unset).length ? { $set: update, $unset: unset } : { $set: update },
      { runValidators: true }
    );
    res.redirect('/manutencoes');
  } catch (err) {
    console.error(err);
    if (err.name === 'StockError') {
      return renderMaintenanceForm(
        res,
        400,
        { ...req.body, _id: req.params.id, componentes: normalizeComponentIds(req.body.componentes) },
        err.message
      );
    }
    res.status(500).send('Erro ao atualizar manutenção');
  }
};

export const remove = async (req, res) => {
  try {
    const manutencao = await Manutencao.findById(req.params.id).lean();

    if (manutencao) {
      await updateComponentStock({ removed: manutencao.componentes || [] });
      await Manutencao.findByIdAndDelete(req.params.id);
    }

    res.redirect('/manutencoes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir manutenção');
  }
};
