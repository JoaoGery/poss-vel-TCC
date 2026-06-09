import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  documento: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  telefone: { type: String, required: true, trim: true },
  endereco: { type: String, trim: true },
  cidade: { type: String, trim: true },
  estado: { type: String, trim: true, uppercase: true },
  cep: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.model('Cliente', clienteSchema);
