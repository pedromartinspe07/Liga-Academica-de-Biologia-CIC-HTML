// Exemplo de como usar JavaScript para notificar o servidor sobre um acesso
document.addEventListener('DOMContentLoaded', (event) => {
    // Envia uma requisição GET para um endpoint no servidor
    fetch('https://labic-html-backend-production.up.railway.app/api/log_acesso')
      .then(response => {
        // Opcional: faz algo com a resposta do servidor
        console.log('Log de acesso enviado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao enviar log de acesso:', error);
      });
  });