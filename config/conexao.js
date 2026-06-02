import mongoose from "mongoose";
//const url = "mongodb+srv://marcelosiedler:ifsul@ifsul.fify4.mongodb.net/"
const url = "mongodb+srv://Joao:123@joao.wowj3.mongodb.net/?retryWrites=true&w=majority&appName=Joao"

const conexao = await mongoose.connect(url)

export default conexao