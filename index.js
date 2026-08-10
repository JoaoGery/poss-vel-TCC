import { createApp } from './config/app.js';

const startServer = async () => {
  try {
    const app = await createApp();
    const port = process.env.PORT || 3001;

    const server = app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`A porta ${port} já está em uso. Defina outra porta com PORT=3002 npm start.`);
        process.exit(1);
      }

      throw err;
    });
  } catch (error) {
    console.error('Falha ao inicializar a aplicação:', error);
    process.exit(1);
  }
};

startServer();

export default null;
