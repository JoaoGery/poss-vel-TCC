import Manutencao from '../models/manutencao.js';
import Componente from '../models/componente.js';
import Cliente from '../models/cliente.js';
import Contador from '../models/contador.js';
import { isValidObjectId, parsePositiveNumber, sanitizeText } from '../utils/validators.js';
import { setFlash } from '../utils/flash.js';

const VALID_STATUSES = ['em_analise', 'em_reparo', 'concluido'];

const nextServiceOrder = async () => {
  const year = new Date().getFullYear();
  const counter = await Contador.findOneAndUpdate(
    { chave: `ordem-servico-${year}` },
    { $inc: { sequencia: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  return `OS-${year}-${String(counter.sequencia).padStart(4, '0')}`;
};

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

const stockError = (message) => {
  const error = new Error(message);
  error.name = 'StockError';
  return error;
};

const reserveComponents = async (componentIds = []) => {
  const reserved = [];

  for (const id of componentIds) {
    const component = await Componente.findById(id).select('nome').lean();
    if (!component) {
      await releaseComponents(reserved);
      throw stockError('Um dos componentes selecionados não foi encontrado. Atualize a página e tente novamente.');
    }

    const result = await Componente.updateOne(
      { _id: id, quantidadeDisponivel: { $gte: 1 } },
      { $inc: { quantidadeDisponivel: -1 } }
    );

    if (!result.modifiedCount) {
      await releaseComponents(reserved);
      throw stockError(`Não há estoque disponível para ${component.nome}.`);
    }

    reserved.push(id);
  }
};

const releaseComponents = async (componentIds = []) => {
  if (componentIds.length) {
    await Componente.updateMany({ _id: { $in: componentIds } }, { $inc: { quantidadeDisponivel: 1 } });
  }
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
    const status = sanitizeText(req.query.status);
    const q = sanitizeText(req.query.q);
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
    const clienteId = String(req.body.cliente || '');
    const marcaComputador = sanitizeText(req.body.marcaComputador);
    const modeloComputador = sanitizeText(req.body.modeloComputador);
    const descricaoProblema = sanitizeText(req.body.descricaoProblema);
    const componentes = normalizeComponentIds(req.body.componentes);

    if (!isValidObjectId(clienteId) || !marcaComputador || !modeloComputador || !descricaoProblema || !componentes.every(isValidObjectId)) {
      return renderMaintenanceForm(
        res,
        400,
        { cliente: clienteId, marcaComputador, modeloComputador, descricaoProblema, componentes },
        'Selecione um cliente e informe os dados do equipamento e do problema.'
      );
    }

    const cliente = await Cliente.exists({ _id: clienteId });
    if (!cliente) {
      return renderMaintenanceForm(res, 400, { cliente: clienteId, marcaComputador, modeloComputador, descricaoProblema, componentes }, 'O cliente selecionado não existe mais.');
    }

    await reserveComponents(componentes);
    try {
      const numeroOrdem = await nextServiceOrder();
      await Manutencao.create({ numeroOrdem, cliente: clienteId, marcaComputador, modeloComputador, descricaoProblema, componentes, status: 'em_analise' });
    } catch (error) {
      await releaseComponents(componentes);
      throw error;
    }

    setFlash(req, 'success', 'Ordem de serviço aberta com sucesso.');
    return res.redirect('/manutencoes');
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
    const cliente = String(req.body.cliente || '');
    const status = sanitizeText(req.body.status);
    const componentes = normalizeComponentIds(req.body.componentes);
    const manutencaoAtual = await Manutencao.findById(req.params.id).lean();

    if (!manutencaoAtual) return res.status(404).send('Manutenção não encontrada');
    
    const update = {
      cliente,
      marcaComputador: sanitizeText(req.body.marcaComputador),
      modeloComputador: sanitizeText(req.body.modeloComputador),
      descricaoProblema: sanitizeText(req.body.descricaoProblema),
      diagnosticoTecnico: sanitizeText(req.body.diagnosticoTecnico),
      status,
      componentes,
      valorTotal: parsePositiveNumber(req.body.valorTotal),
      observacoes: sanitizeText(req.body.observacoes)
    };

    if (!isValidObjectId(update.cliente) || !update.marcaComputador || !update.modeloComputador || !update.descricaoProblema || !VALID_STATUSES.includes(status) || !componentes.every(isValidObjectId)) {
      return renderMaintenanceForm(
        res,
        400,
        { ...manutencaoAtual, ...update, _id: req.params.id },
        'Selecione um cliente e informe os dados do equipamento e do problema.'
      );
    }

    const unset = {};

    if (status === 'concluido' && manutencaoAtual.status !== 'concluido') {
      update.dataSaida = new Date();
    } else {
      unset.dataSaida = '';
    }

    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const clienteExiste = await Cliente.exists({ _id: update.cliente });
    if (!clienteExiste) {
      return renderMaintenanceForm(res, 400, { ...manutencaoAtual, ...update, _id: req.params.id }, 'O cliente selecionado não existe mais.');
    }

    const stockDiff = getComponentDiff(manutencaoAtual.componentes, componentes);
    await reserveComponents(stockDiff.added);
    try {
      await Manutencao.findByIdAndUpdate(req.params.id, Object.keys(unset).length ? { $set: update, $unset: unset } : { $set: update }, { runValidators: true });
    } catch (error) {
      await releaseComponents(stockDiff.added);
      throw error;
    }
    await releaseComponents(stockDiff.removed);
    setFlash(req, 'success', 'Ordem de serviço atualizada.');
    return res.redirect('/manutencoes');
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
      await releaseComponents(normalizeComponentIds(manutencao.componentes || []));
      await Manutencao.findByIdAndDelete(req.params.id);
      setFlash(req, 'success', 'Ordem de serviço excluída e componentes devolvidos ao estoque.');
    }

    res.redirect('/manutencoes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir manutenção');
  }
};
