import Cliente from '../models/cliente.js';

const clienteData = (body) => ({
  nome: (body.nome || '').trim(),
  documento: body.documento || '',
  email: (body.email || '').trim().toLowerCase(),
  telefone: (body.telefone || '').trim(),
  endereco: body.endereco || '',
  cidade: body.cidade || '',
  estado: (body.estado || '').trim().toUpperCase(),
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
  res.render('cliente/add', { cliente: {}, error: null });
};

export const create = async (req, res) => {
  try {
    const data = clienteData(req.body);
    if (!data.nome || !data.email || !data.telefone) {
      return res.status(400).render('cliente/add', {
        cliente: data,
        error: 'Informe nome, e-mail e telefone para cadastrar o cliente.'
      });
    }
    await Cliente.create(data);
    res.redirect('/cliente');
  } catch (err) {
    console.error(err);
    const message = err.code === 11000 ? 'E-mail já cadastrado.' : 'Erro ao criar cliente.';
    res.status(400).render('cliente/add', { cliente: req.body, error: message });
  }
};

export const formEdit = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) return res.status(404).send('Cliente não encontrado');
    res.render('cliente/edt', { cliente, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao abrir edição');
  }
};

export const update = async (req, res) => {
  try {
    const data = clienteData(req.body);
    if (!data.nome || !data.email || !data.telefone) {
      return res.status(400).render('cliente/edt', {
        cliente: { ...data, _id: req.params.id },
        error: 'Informe nome, e-mail e telefone para atualizar o cliente.'
      });
    }
    await Cliente.findByIdAndUpdate(req.params.id, data, { runValidators: true });
    res.redirect('/cliente');
  } catch (err) {
    console.error(err);
    const message = err.code === 11000 ? 'E-mail já cadastrado.' : 'Erro ao atualizar cliente.';
    res.status(400).render('cliente/edt', { cliente: { ...req.body, _id: req.params.id }, error: message });
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
