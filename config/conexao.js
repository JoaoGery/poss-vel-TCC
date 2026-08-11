import mongoose from "mongoose";

const url = process.env.MONGODB_URI;

if (!url) {
  throw new Error('Defina a variável MONGODB_URI no arquivo .env');
}

const conexao = await mongoose.connect(url);

export default conexao;
