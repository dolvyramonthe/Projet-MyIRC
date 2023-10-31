export default function chatPage(): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>chat page</title>
        <style>
          body { 
            margin: 0; 
            padding-bottom: 3rem; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          }

          #form { 
            background: rgba(0, 0, 0, 0.15); 
            padding: 0.25rem; 
            position: fixed; 
            bottom: 100px; 
            left: 200px; 
            right: 200px; 
            display: flex; 
            height: 3rem; 
            box-sizing: border-box; 
            backdrop-filter: blur(10px); 
          }
          #input { 
            border: none; 
            padding: 0 1rem; 
            flex-grow: 1; 
            border-radius: 2rem; 
            margin: 0.25rem; 
          }
          #input:focus { 
            outline: none; 
          }
          #form > button { 
            background: #3333FF; 
            border: none; 
            padding: 0 1rem; 
            margin: 0.25rem; 
            border-radius: 2rem; 
            outline: none; 
            color: #fff; 
          }

          #messages { 
            list-style-type: none; 
            margin: 0; 
            padding: 0; 
          }
          #messages > li { 
            padding: 0.5rem 1rem; 
          }
          #messages > li:nth-child(odd) { 
            background: #efefef; 
          }
        </style>
      </head>
      <body>
        <ul id="messages"></ul>
        <form id="form" action="">
          <input id="input" autocomplete="off" /><button>Send</button>
        </form>
      </body>
    </html>
    `;
}