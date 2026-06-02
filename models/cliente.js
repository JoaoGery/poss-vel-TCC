import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: String, required: true },
  endereco: { type: String },
  cidade: { type: String },
  cep: { type: String }
}, { timestamps: true });

export default mongoose.model('Cliente', clienteSchema);
