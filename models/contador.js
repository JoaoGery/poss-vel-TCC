import mongoose from 'mongoose';

const contadorSchema = new mongoose.Schema({
  chave: { type: String, required: true, unique: true },
  sequencia: { type: Number, default: 0 }
});

export default mongoose.model('Contador', contadorSchema);
