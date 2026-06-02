import Manutencao from '../models/manutencao.js';
import Componente from '../models/componente.js';
import Cliente from '../models/cliente.js';

export const list = async (req, res) => {
  try {
    const manutencoes = await Manutencao.find().populate('cliente componentes').lean();
    res.render('manutencao/list', { manutencoes });
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
    const clientes = await Cliente.find().lean();
    const componentes = await Componente.find().lean();
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

    const manutencao = await Manutencao.create({
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
    const manutencao = await Manutencao.findById(req.params.id).lean();
    const clientes = await Cliente.find().lean();
    const componentes = await Componente.find().lean();
    
    if (!manutencao) return res.status(404).send('Manutenção não encontrada');
    res.render('manutencao/form', { manutencao, clientes, componentes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir edição');
  }
};

export const update = async (req, res) => {
  try {
    const { marcaComputador, modeloComputador, descricaoProblema, diagnosticoTecnico, status, valorTotal, observacoes } = req.body;
    
    const update = {
      marcaComputador,
      modeloComputador,
      descricaoProblema,
      diagnosticoTecnico,
      status,
      valorTotal: valorTotal ? Number(valorTotal) : 0,
      observacoes
    };

    if (status === 'concluido') {
      update.dataSaida = new Date();
    }

    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    await Manutencao.findByIdAndUpdate(req.params.id, update);
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
