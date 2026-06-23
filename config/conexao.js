import mongoose from "mongoose";

const url = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/manutencao_computadores";

const conexao = await mongoose.connect(url);

export default conexao;
