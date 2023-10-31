export default function loginPage(): string {
    return `
    <!DOCTYPE html>
      <html>
        <body>
          <h2>Login</h2>
          <form method="post" action="/login">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required><br><br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required><br><br>
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `;
}