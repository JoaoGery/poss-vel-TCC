import mongoose from 'mongoose';
import Cliente from './models/cliente.js';
import Componente from './models/componente.js';
import Manutencao from './models/manutencao.js';

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manutencao_computadores';

async function main() {
  console.log('Conectando em:', mongoUrl);
  await mongoose.connect(mongoUrl);
  console.log('✅ MongoDB conectado');

  const cliente = new Cliente({
    nome: 'Teste MongoDB Cliente',
    documento: '99999999999',
    email: `teste-cliente-${Date.now()}@exemplo.com`,
    telefone: '5551999999999',
    endereco: 'Rua do Teste, 123',
    cidade: 'Testópolis',
    estado: 'RS',
    cep: '90000-000'
  });
  const clienteSalvo = await cliente.save();
  console.log('✅ Cliente salvo:', clienteSalvo._id.toString());

  const componente = new Componente({
    nome: 'Teste Componente',
    categoria: 'Outro',
    quantidadeDisponivel: 5,
    precoUnitario: 150.00,
    descricao: 'Componente usado somente para teste',
    fornecedor: 'Fornecedor Teste'
  });
  const componenteSalvo = await componente.save();
  console.log('✅ Componente salvo:', componenteSalvo._id.toString());

  const manutencao = new Manutencao({
    cliente: clienteSalvo._id,
    marcaComputador: 'TesteMarca',
    modeloComputador: 'TesteModelo',
    descricaoProblema: 'Falha no boot',
    diagnosticoTecnico: 'Teste de diagnóstico',
    componentes: [componenteSalvo._id],
    valorTotal: 200.00,
    observacoes: 'Registro de manutenção de teste'
  });
  const manutencaoSalva = await manutencao.save();
  console.log('✅ Manutencao salva:', manutencaoSalva._id.toString());

  await mongoose.disconnect();
  console.log('Desconectado');
}

main().catch(err => {
  console.error('❌ Erro no teste MongoDB:', err);
  process.exit(1);
});
