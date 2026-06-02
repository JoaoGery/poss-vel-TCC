import mongoose from 'mongoose';

const ComponenteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  categoria: { 
    type: String, 
    enum: ['Processador', 'RAM', 'SSD', 'HDD', 'Fonte', 'Placa-Mãe', 'Cooler', 'Placa de Vídeo', 'Outro'],
    required: true 
  },
  quantidadeDisponivel: { type: Number, required: true, default: 0 },
  precoUnitario: { type: Number, required: true },
  descricao: { type: String },
  fornecedor: { type: String }
}, { timestamps: true });

export default mongoose.model('Componente', ComponenteSchema);
