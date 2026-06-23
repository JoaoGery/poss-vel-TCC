import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  senha: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

// hash antes de salvar
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

UsuarioSchema.methods.compareSenha = function(senha) {
  return bcrypt.compare(senha, this.senha);
};

export default mongoose.model('Usuario', UsuarioSchema);
