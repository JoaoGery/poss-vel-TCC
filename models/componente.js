import mongoose from 'mongoose';

const ComponenteSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  categoria: { 
    type: String, 
    enum: ['Processador', 'RAM', 'SSD', 'HDD', 'Fonte', 'Placa-Mãe', 'Cooler', 'Placa de Vídeo', 'Outro'],
    required: true 
  },
  quantidadeDisponivel: { type: Number, required: true, default: 0, min: 0 },
  precoUnitario: { type: Number, required: true, min: 0 },
  descricao: { type: String, trim: true },
  fornecedor: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.model('Componente', ComponenteSchema);
