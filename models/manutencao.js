import mongoose from 'mongoose';

const ManutencaoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  marcaComputador: { type: String, required: true },
  modeloComputador: { type: String, required: true },
  descricaoProblema: { type: String, required: true },
  diagnosticoTecnico: { type: String },
  dataEntrada: { type: Date, default: Date.now },
  dataSaida: { type: Date },
  status: { 
    type: String, 
    enum: ['em_analise', 'em_reparo', 'concluido'], 
    default: 'em_analise' 
  },
  componentes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Componente' 
  }],
  valorTotal: { type: Number, default: 0 },
  observacoes: { type: String }
}, { timestamps: true });

export default mongoose.model('Manutencao', ManutencaoSchema);
