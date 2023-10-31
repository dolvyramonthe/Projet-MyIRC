export default function homePage(): string {
    return `
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>chat app home page</title>
        </head>
        <body>
          <h2>Welcome to the chat app !</h2>
          <button class="js-login-button" id="btn">Login to chat</button>
          <script>
            document.addEventListener('DOMContentLoaded', () => {
              const button = document.getElementById('btn');

              if (button) {
                button.addEventListener('click', handleButtonClick);
              }
            });

            function handleButtonClick(event) {
              window.location.href = '/login';
            }
          </script>
        </body>
      </html>
    `;
}