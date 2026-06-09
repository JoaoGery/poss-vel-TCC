import Cliente from '../models/cliente.js';

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

export const list = async (req, res) => {
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
};

export const view = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) return res.status(404).send('Cliente não encontrado');
    res.redirect(`/cliente/${cliente._id}/editar`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar cliente');
  }
};

export const formCreate = (req, res) => {
  res.render('cliente/add', { cliente: {} });
};

export const create = async (req, res) => {
  try {
    const data = clienteData(req.body);
    await Cliente.create(data);
    res.redirect('/cliente');
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).send('Email já cadastrado');
    res.status(500).send('Erro ao criar cliente');
  }
};

export const formEdit = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) return res.status(404).send('Cliente não encontrado');
    res.render('cliente/edt', { cliente });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir edição');
  }
};

export const update = async (req, res) => {
  try {
    await Cliente.findByIdAndUpdate(req.params.id, clienteData(req.body), { runValidators: true });
    res.redirect('/cliente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar cliente');
  }
};

export const remove = async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.redirect('/cliente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir cliente');
  }
};
