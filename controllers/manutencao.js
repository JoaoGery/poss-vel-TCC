import Manutencao from '../models/manutencao.js';
import Componente from '../models/componente.js';
import Cliente from '../models/cliente.js';

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
    res.render('manutencao/form', { manutencao: {}, clientes, componentes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir formulário de manutenção');
  }
};

export const create = async (req, res) => {
  try {
    const { cliente: clienteId, marcaComputador, modeloComputador, descricaoProblema } = req.body;
    const cliente = await Cliente.findById(clienteId);
    
    if (!cliente) return res.status(400).send('Cliente inválido');

    await Manutencao.create({
      cliente: clienteId,
      marcaComputador,
      modeloComputador,
      descricaoProblema,
      status: 'em_analise'
    });

    res.redirect('/manutencoes');
  } catch (err) {
    console.error(err);
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
    res.render('manutencao/form', { manutencao, clientes, componentes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir edição');
  }
};

export const update = async (req, res) => {
  try {
    const { cliente, marcaComputador, modeloComputador, descricaoProblema, diagnosticoTecnico, status, valorTotal, observacoes } = req.body;
    
    const update = {
      cliente,
      marcaComputador,
      modeloComputador,
      descricaoProblema,
      diagnosticoTecnico,
      status,
      valorTotal: valorTotal ? Number(valorTotal) : 0,
      observacoes
    };

    const unset = {};

    if (status === 'concluido') {
      update.dataSaida = new Date();
    } else {
      unset.dataSaida = '';
    }

    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    await Manutencao.findByIdAndUpdate(
      req.params.id,
      Object.keys(unset).length ? { $set: update, $unset: unset } : { $set: update },
      { runValidators: true }
    );
    res.redirect('/manutencoes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar manutenção');
  }
};

export const remove = async (req, res) => {
  try {
    await Manutencao.findByIdAndDelete(req.params.id);
    res.redirect('/manutencoes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir manutenção');
  }
};
